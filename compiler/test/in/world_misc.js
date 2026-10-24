import { playSound, senseWeather, setWeather, SyncLock } from "mlogjs:world";

playSound.global({
  sound: Sounds.pew,
  volume: 1,
  pitch: 1,
  pan: 0,
  limit: true,
});
playSound.positional({
  sound: Sounds.artillery,
  volume: 1,
  pitch: 1,
  x: 10,
  y: 20,
  limit: false,
});

const isRaining = senseWeather(Weathers.rain);
setWeather(Weathers.rain, !isRaining);

let initial = 100;
const lock = new SyncLock(initial);
lock.value = 200;
lock.sendToClients();
