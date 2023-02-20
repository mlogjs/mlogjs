import { ref, shallowRef, watch, type Ref, type ShallowRef } from "vue";
import { debounce } from "../util";
import type * as monaco from "monaco-editor";
export interface FileData {
  id?: number;
  name: string;
  content: string;
}

const dbData = {
  name: "user_scripts",
  version: 1,
  filesStoreName: "files",
};

const lastOpenFileKey = "last-open-file";
const debounceSaveDelay = 1000;

export function usePersistentFiles(
  editorRef: ShallowRef<monaco.editor.IStandaloneCodeEditor | undefined>,
  outEditorRef: ShallowRef<monaco.editor.IStandaloneCodeEditor | undefined>
) {
  const currentFile = shallowRef<PersistentFile>();
  const files = shallowRef<PersistentFile[]>([]);

  fetchFiles();

  watch([currentFile, files], ([file]) => {
    if (!file) return;
    localStorage.setItem(lastOpenFileKey, file.name);
  });

  async function fetchFiles() {
    const listedFiles = await getAllFiles();
    const selectedFileName = localStorage.getItem(lastOpenFileKey);
    if (listedFiles.length > 0) {
      const first =
        listedFiles.find(file => file.name === selectedFileName) ??
        listedFiles[0];
      await first.load();
      currentFile.value = first;
      files.value = listedFiles;
    } else {
      const file = new PersistentFile("script.ts", {
        content: localStorage.getItem("code") ?? "",
      });
      await file.save();
      currentFile.value = file;
      files.value = [file];
    }
  }

  async function addFile(data: FileData): Promise<PersistentFile> {
    const file = new PersistentFile(data.name, data);
    await file.save();
    files.value = [...files.value, file].sort((a, b) => {
      if (a.name > b.name) return 1;
      if (a.name < b.name) return -1;
      return 0;
    });
    currentFile.value = file;
    return file;
  }

  async function removeFile(file: PersistentFile) {
    const db = await getDB();
    await file.delete(db);
    if (currentFile.value === file) {
      currentFile.value = files.value[0];
      await currentFile.value.load();
    }
    files.value = files.value.filter(item => item != file);
  }

  async function renameFile(file: PersistentFile, name: string) {
    const data = await file.load();
    file.name = name;
    file.data = {
      ...data,
      name,
    };
    file.debouncedSave();
    files.value = [...files.value].sort((a, b) => {
      if (a.name > b.name) return 1;
      if (a.name < b.name) return -1;
      return 0;
    });
  }

  async function changeCurrentFile(file: PersistentFile) {
    await file.load();
    currentFile.value = file;
    editorRef.value?.revealLine(0);
    outEditorRef.value?.revealLine(0);
  }

  return {
    currentFile,
    files,
    addFile,
    removeFile,
    renameFile,
    changeCurrentFile,
  };
}

export function useFileSaver(
  currentFile: Ref<PersistentFile | undefined>,
  code: Ref<string>
) {
  watch(currentFile, file => {
    if (file?.data?.content == undefined) return;
    code.value = file.data.content;
  });

  watch([currentFile, code], ([newFile, newCode], [oldFile, oldCode]) => {
    if (newCode === oldCode) return;
    if (!newFile || !oldFile) return;
    if (newFile !== oldFile) return;
    newFile.data = {
      name: newFile.name,
      content: newCode,
      id: newFile.data?.id,
    };
    newFile.debouncedSave();
  });
}

function getDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(dbData.name, dbData.version);
    request.onerror = e => reject(request.error);
    request.onsuccess = e => resolve(request.result);
    request.onupgradeneeded = e => {
      const db = request.result;
      const fileStore = db.createObjectStore(dbData.filesStoreName, {
        keyPath: "id",
        autoIncrement: true,
      });
      fileStore.createIndex("name", "name", { unique: true });
    };
  });
}

async function getAllFiles(database?: IDBDatabase): Promise<PersistentFile[]> {
  const db = database ?? (await getDB());
  return await new Promise((resolve, reject) => {
    const transaction = db.transaction(dbData.filesStoreName, "readonly");
    let files: PersistentFile[] = [];
    transaction.oncomplete = () => resolve(files);
    transaction.onerror = () => reject(transaction.error);
    const store = transaction.objectStore(dbData.filesStoreName);
    const index = store.index("name");
    const cursorRequest = index.openKeyCursor();
    cursorRequest.onsuccess = e => {
      const cursor = cursorRequest.result;
      if (!cursor) return;

      files.push(new PersistentFile(cursor.key as string));
      cursor.continue();
    };
  });
}

export class PersistentFile {
  data?: FileData;
  private beforeUnloadListener: (e: BeforeUnloadEvent) => void;
  private debouncedHandler: () => void;

  constructor(public name: string, data?: Omit<FileData, "name">) {
    if (data) {
      this.data = {
        ...data,
        name,
      };
    }

    this.beforeUnloadListener = e => {
      e.preventDefault();
      e.returnValue = " ";
      return null;
    };

    this.debouncedHandler = debounce(async () => {
      await this.save();
      window.removeEventListener("beforeunload", this.beforeUnloadListener);
    }, debounceSaveDelay);
  }

  async save(database?: IDBDatabase): Promise<void> {
    const { data } = this;
    if (!data) throw new Error("Cannot save a file that hasn't been loaded");
    const db = database ?? (await getDB());

    const id = await new Promise<number>((resolve, reject) => {
      const transaction = db.transaction(dbData.filesStoreName, "readwrite");
      transaction.oncomplete = () => resolve(request.result as number);
      transaction.onerror = () => reject(transaction.error);
      const store = transaction.objectStore(dbData.filesStoreName);
      const request = store.put(data);
    });
    this.data = {
      ...data,
      id,
    };
  }

  async delete(database?: IDBDatabase): Promise<void> {
    const db = database ?? (await getDB());

    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(dbData.filesStoreName, "readwrite");
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);

      const store = transaction.objectStore(dbData.filesStoreName);
      const index = store.index("name");
      const request = index.openKeyCursor(this.name);

      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) return;
        store.delete(cursor.primaryKey);
      };
    });
  }

  async load(database?: IDBDatabase): Promise<FileData> {
    if (this.data) return this.data;
    const db = database ?? (await getDB());
    this.data = await new Promise((resolve, reject) => {
      const transaction = db.transaction(dbData.filesStoreName, "readonly");
      transaction.oncomplete = () => resolve(request.result);
      transaction.onerror = () => reject(transaction.error);
      const store = transaction.objectStore(dbData.filesStoreName);
      const index = store.index("name");
      const request = index.get(this.name);
    });
    return this.data;
  }

  debouncedSave() {
    window.addEventListener("beforeunload", this.beforeUnloadListener);
    this.debouncedHandler();
  }
}
