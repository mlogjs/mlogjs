import { playMusic, PVars } from "mlogjs:world";

playMusic("game1");
playMusic("fine", false);
const isPlaying = PVars.clientMusicPlaying;
const track = PVars.clientCurrentMusic;
