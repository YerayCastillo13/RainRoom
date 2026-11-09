/* Dimrain · genera los audios de assets/audio a partir de las grabaciones originales de Freesound (CC0).
   Uso:  node tools/build-audio.mjs <carpeta-con-los-originales> [rain|wind|fire|traffic]
   Necesita ffmpeg en el PATH. Los originales no se guardan en el repositorio (ver LICENCIAS.md).
   - Bucles (rain, traffic, fire, wind): se recorta un tramo estable y se funde su final con su principio (potencia constante),
     de modo que el archivo enlaza consigo mismo sin cortes aunque se reproduzca con loop nativo.
     Después se iguala la sonoridad (-20 LUFS, la de rain.mp3) y se limita el pico.
   - Truenos: se recortan truenos sueltos de dos grabaciones, se normaliza el pico de cada uno y se encadenan con
     un hueco de silencio. thunder.json guarda dónde empieza cada uno. */
import {execFileSync,spawnSync} from "node:child_process";
import {writeFileSync,mkdirSync,mkdtempSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {fileURLToPath} from "node:url";
const src=process.argv[2];if(!src){console.error("Falta la carpeta de originales");process.exit(1)}
const out=fileURLToPath(new URL("../assets/audio/",import.meta.url));mkdirSync(out,{recursive:true});
const tmp=mkdtempSync(join(tmpdir(),"rr-audio-"));
const ff=(...a)=>execFileSync("ffmpeg",["-v","error","-y",...a],{maxBuffer:1<<28});
const lufs=f=>{const r=spawnSync("ffmpeg",["-nostats","-i",f,"-af","ebur128","-f","null","-"],{encoding:"utf8"});const m=[...r.stderr.matchAll(/I:\s+(-?[\d.]+) LUFS/g)].pop();return +m[1]};
const maxdb=f=>{const r=spawnSync("ffmpeg",["-nostats","-i",f,"-af","volumedetect","-f","null","-"],{encoding:"utf8"});return +/max_volume: (-?[\d.]+) dB/.exec(r.stderr)[1]};

/* [archivo original, inicio, duración final, fundido, destino] */
const LOOPS=[
 ["669416_11673893-hq.mp3",280,45,4,"traffic.mp3"],
 ["501417_10869493-hq.mp3",210,45,4,"fire.mp3"],
 ["156414_1661766-hq.mp3",50,55,5,"wind.mp3"],
 ["662016_213249-hq.mp3",630,45,4,"rain.mp3"]];
/* La lluvia original lleva zumbidos de motor/red (100 Hz y armónicos, 288 Hz...) y retumbe grave: se quitan con muescas de 3 Hz y un paso alto de 4.º orden.
   Además, 3 golpes sueltos (15,10 s, 30,11 s y 34,61 s del bucle) se taparon a mano con lluvia limpia de otro punto del mismo bucle; este script no lo repite. */
const HUM=[100.3,141.3,199.9,240.9,259.1,288,287.4,300.1,341.2,358.7,382.2,399.7,452.2,575.5,781.9,96.2].map(f=>`bandreject=f=${f}:width_type=h:w=3`).join(",");
const PRE={"rain.mp3":`highpass=f=90:poles=2,highpass=f=90:poles=2,${HUM}`};
const only=process.argv[3]; /* opcional: "rain" regenera solo rain.mp3 */
for(const [f,ss,L,X,dst] of LOOPS){
 if(only&&!dst.startsWith(only))continue;
 const wav=join(tmp,dst+".wav");
 ff("-ss",ss,"-t",L+X,"-i",join(src,f),"-filter_complex",
  `[0:a]aresample=44100,${PRE[dst]||"highpass=f=25"},asplit=3[a][b][c];`+
  /* asetpts ANTES de afade: si no, el fundido de salida de [t] se calcula con los tiempos originales (L..L+X), ya pasados,
     y la cola queda muda: el bucle empezaría casi en silencio y subiría 3-4 s (un bajón de volumen en cada vuelta). */
  `[a]atrim=0:${X},asetpts=PTS-STARTPTS,afade=t=in:d=${X}:curve=qsin[h];`+
  `[b]atrim=${L}:${L+X},asetpts=PTS-STARTPTS,afade=t=out:d=${X}:curve=qsin[t];`+
  `[c]atrim=${X}:${L},asetpts=PTS-STARTPTS[m];`+
  `[h][t]amix=inputs=2:normalize=0:duration=longest[bl];[bl][m]concat=n=2:v=0:a=1[o]`,"-map","[o]",wav);
 const g=-20-lufs(wav);
 ff("-i",wav,"-af",`volume=${g.toFixed(2)}dB,alimiter=limit=0.8:level=disabled`,"-c:a","libmp3lame","-b:a","96k",join(out,dst));
 console.log(dst,"ganancia",g.toFixed(1),"dB")}

if(only){console.log("listo (solo "+only+")");process.exit(0)}
/* [archivo, inicio, duración] */
const BOOMS=[
 ["238295_4308636-hq.mp3",4.4,12.6],["238295_4308636-hq.mp3",20,9.6],["238295_4308636-hq.mp3",29.8,11.8],["238295_4308636-hq.mp3",42.2,9.8],
 ["238295_4308636-hq.mp3",56.1,9.9],["238295_4308636-hq.mp3",68.2,12.8],["238295_4308636-hq.mp3",82.3,8.7],
 ["625354_5790048-hq.mp3",4.2,14.3],["625354_5790048-hq.mp3",110,14],["625354_5790048-hq.mp3",207,9],["625354_5790048-hq.mp3",141,15],
 ["625354_5790048-hq.mp3",231.4,13.6],["625354_5790048-hq.mp3",255.2,12.8],["625354_5790048-hq.mp3",82.2,10.8]];
const GAP=.4,list=[],offs=[];let t=0;
BOOMS.forEach(([f,ss,d],i)=>{const w=join(tmp,`b${i}.wav`);
 ff("-ss",ss,"-t",d,"-i",join(src,f),"-ac","1","-ar","44100","-af",`highpass=f=22,afade=t=in:d=0.01,afade=t=out:st=${d-2.5}:d=2.5:curve=qsin`,w);
 const w2=join(tmp,`n${i}.wav`);ff("-i",w,"-af",`volume=${(-3-maxdb(w)).toFixed(2)}dB`,w2);list.push(w2);offs.push([+t.toFixed(2),d]);t+=d+GAP});
const sil=join(tmp,"sil.wav");ff("-f","lavfi","-i",`anullsrc=r=44100:cl=mono`,"-t",GAP,sil);
const fwd=p=>p.split(String.fromCharCode(92)).join("/");
const lst=join(tmp,"l.txt");
writeFileSync(lst,list.map(p=>["file '"+fwd(p)+"'","file '"+fwd(sil)+"'"].join("\n")).join("\n"));
ff("-f","concat","-safe","0","-i",lst,"-c:a","libmp3lame","-b:a","64k",join(out,"thunder.mp3"));
writeFileSync(join(out,"thunder.json"),JSON.stringify(offs));
console.log("thunder.mp3",offs.length,"truenos",t.toFixed(1),"s");
