// @ts-nocheck
var __defProp=Object.defineProperty;var __name=(target,value)=>__defProp(target,"name",{value,configurable:true});import express from"express";import{GoogleGenAI}from"@google/genai";import{initializeApp}from"firebase/app";import{doc,getDoc,getFirestore,setDoc,deleteDoc,getDocs,collection,query,orderBy,limit,setLogLevel}from"firebase/firestore";import webpush from"web-push";import dotenv from"dotenv";import fs from"fs";import path from"path";import{fileURLToPath}from"url";dotenv.config();try{setLogLevel("silent")}catch{}
const BASTIA_OFFICIAL_TIMETABLE_2026=[{day:12,month:10,fajr:"06:03",shuruk:"07:19",dhuhr:"12:59",asr:"16:03",maghrib:"18:36",ishaa:"19:53"},{day:13,month:10,fajr:"06:04",shuruk:"07:20",dhuhr:"12:58",asr:"16:02",maghrib:"18:34",ishaa:"19:51"},{day:14,month:10,fajr:"06:05",shuruk:"07:21",dhuhr:"12:58",asr:"16:01",maghrib:"18:33",ishaa:"19:49"},{day:15,month:10,fajr:"06:06",shuruk:"07:22",dhuhr:"12:58",asr:"16:00",maghrib:"18:31",ishaa:"19:48"},{day:16,month:10,fajr:"06:07",shuruk:"07:23",dhuhr:"12:58",asr:"15:58",maghrib:"18:29",ishaa:"19:46"},{day:17,month:10,fajr:"06:08",shuruk:"07:25",dhuhr:"12:58",asr:"15:57",maghrib:"18:28",ishaa:"19:45"},{day:18,month:10,fajr:"06:10",shuruk:"07:26",dhuhr:"12:57",asr:"15:56",maghrib:"18:26",ishaa:"19:43"},{day:19,month:10,fajr:"06:11",shuruk:"07:27",dhuhr:"12:57",asr:"15:55",maghrib:"18:25",ishaa:"19:42"},{day:20,month:10,fajr:"06:12",shuruk:"07:28",dhuhr:"12:57",asr:"15:53",maghrib:"18:23",ishaa:"19:40"},{day:21,month:10,fajr:"06:13",shuruk:"07:29",dhuhr:"12:57",asr:"15:52",maghrib:"18:21",ishaa:"19:39"},{day:22,month:10,fajr:"06:14",shuruk:"07:31",dhuhr:"12:57",asr:"15:51",maghrib:"18:20",ishaa:"19:37"},{day:23,month:10,fajr:"06:15",shuruk:"07:32",dhuhr:"12:56",asr:"15:50",maghrib:"18:18",ishaa:"19:36"},{day:24,month:10,fajr:"06:16",shuruk:"07:33",dhuhr:"12:56",asr:"15:48",maghrib:"18:17",ishaa:"19:34"},{day:25,month:10,fajr:"05:19",shuruk:"06:36",dhuhr:"11:56",asr:"14:46",maghrib:"17:14",ishaa:"18:31"},{day:26,month:10,fajr:"05:20",shuruk:"06:37",dhuhr:"11:56",asr:"14:45",maghrib:"17:12",ishaa:"18:30"},{day:27,month:10,fajr:"05:21",shuruk:"06:38",dhuhr:"11:56",asr:"14:44",maghrib:"17:11",ishaa:"18:29"},{day:28,month:10,fajr:"05:22",shuruk:"06:39",dhuhr:"11:56",asr:"14:43",maghrib:"17:09",ishaa:"18:27"},{day:29,month:10,fajr:"05:23",shuruk:"06:41",dhuhr:"11:56",asr:"14:41",maghrib:"17:08",ishaa:"18:26"},{day:30,month:10,fajr:"05:24",shuruk:"06:42",dhuhr:"11:56",asr:"14:40",maghrib:"17:07",ishaa:"18:25"},{day:31,month:10,fajr:"05:26",shuruk:"06:43",dhuhr:"11:56",asr:"14:39",maghrib:"17:05",ishaa:"18:24"},{day:1,month:11,fajr:"05:27",shuruk:"06:45",dhuhr:"11:56",asr:"14:38",maghrib:"17:04",ishaa:"18:22"},{day:2,month:11,fajr:"05:28",shuruk:"06:46",dhuhr:"11:56",asr:"14:37",maghrib:"17:03",ishaa:"18:21"},{day:3,month:11,fajr:"05:29",shuruk:"06:47",dhuhr:"11:56",asr:"14:36",maghrib:"17:01",ishaa:"18:20"},{day:4,month:11,fajr:"05:30",shuruk:"06:48",dhuhr:"11:56",asr:"14:35",maghrib:"17:00",ishaa:"18:19"},{day:5,month:11,fajr:"05:31",shuruk:"06:50",dhuhr:"11:56",asr:"14:34",maghrib:"16:59",ishaa:"18:18"},{day:6,month:11,fajr:"05:32",shuruk:"06:51",dhuhr:"11:56",asr:"14:33",maghrib:"16:58",ishaa:"18:17"},{day:7,month:11,fajr:"05:33",shuruk:"06:52",dhuhr:"11:56",asr:"14:32",maghrib:"16:57",ishaa:"18:16"},{day:8,month:11,fajr:"05:35",shuruk:"06:53",dhuhr:"11:56",asr:"14:31",maghrib:"16:55",ishaa:"18:15"},{day:9,month:11,fajr:"05:36",shuruk:"06:55",dhuhr:"11:56",asr:"14:30",maghrib:"16:54",ishaa:"18:14"},{day:10,month:11,fajr:"05:37",shuruk:"06:56",dhuhr:"11:56",asr:"14:30",maghrib:"16:53",ishaa:"18:13"}];
const DEFAULT_LOCATIONS=[{id:"bastia-umbra",name:"Bastia Umbra",region:"Umbria (Perugia)",country:"Italia",latitude:43.0683,longitude:12.5511,timezone:"Europe/Rome"},{id:"perugia",name:"Perugia",region:"Umbria",country:"Italia",latitude:43.1107,longitude:12.3908,timezone:"Europe/Rome"},{id:"assisi",name:"Assisi",region:"Umbria (Perugia)",country:"Italia",latitude:43.0707,longitude:12.6196,timezone:"Europe/Rome"},{id:"bastia-corsica",name:"Bastia (Corsica)",region:"Haute-Corse",country:"Francia",latitude:42.6973,longitude:9.4509,timezone:"Europe/Paris"},{id:"roma",name:"Roma",region:"Lazio",country:"Italia",latitude:41.9028,longitude:12.4964,timezone:"Europe/Rome"},{id:"milano",name:"Milano",region:"Lombardia",country:"Italia",latitude:45.4642,longitude:9.19,timezone:"Europe/Rome"},{id:"casablanca",name:"Casablanca",region:"Grand Casablanca",country:"Marocco",latitude:33.5731,longitude:-7.5898,timezone:"Africa/Casablanca"},{id:"makkah",name:"Makkah Al-Mukarramah",region:"Mecca",country:"Arabia Saudita",latitude:21.4225,longitude:39.8262,timezone:"Asia/Riyadh"}];
function getPrayerTimesForDate(date,location){const d=date.getDate(),m=date.getMonth()+1;const official=BASTIA_OFFICIAL_TIMETABLE_2026.find(item=>item.day===d&&item.month===m)||BASTIA_OFFICIAL_TIMETABLE_2026[13];return[{id:"Fajr",nameIt:"Fajr (Alba)",nameAr:"\u0627\u0644\u0641\u062C\u0631",time:official.fajr},{id:"Sunrise",nameIt:"Shuruq (Sorgente)",nameAr:"\u0627\u0644\u0634\u0631\u0648\u0642",time:official.shuruk},{id:"Dhuhr",nameIt:"Dhuhr (Mezzogiorno)",nameAr:"\u0627\u0644\u0638\u0647\u0631",time:official.dhuhr},{id:"Asr",nameIt:"Asr (Pomeriggio)",nameAr:"\u0627\u0644\u0639\u0635\u0631",time:official.asr},{id:"Maghrib",nameIt:"Maghrib (Tramonto)",nameAr:"\u0627\u0644\u0645\u063A\u0631\u0628",time:official.maghrib},{id:"Isha",nameIt:"Isha (Notte)",nameAr:"\u0627\u0644\u0639\u0634\u0627\u0621",time:official.ishaa}]}
const __filename=fileURLToPath(import.meta.url);const __dirname=path.dirname(__filename);const isProduction=process.env.NODE_ENV==="production";const port=Number(process.env.PORT)||3e3;const PERMANENT_VAPID_KEYS={publicKey:"BBmeblTaHn-6a7SKl-k2G0i9tv6GhJpJupzWOy71oWtUvqGCXBkuNGObPDb7eSiHPTEd08QGmckOMVKdetxKTH8",privateKey:"-3VMCdozPYRjjg5PPl3koxn0Jh4EKv68Zr2u72mAKgU"};const VAPID_FILE=path.resolve(__dirname,".vapid-keys.json");let vapidKeys=PERMANENT_VAPID_KEYS;try{fs.writeFileSync(VAPID_FILE,JSON.stringify(PERMANENT_VAPID_KEYS,null,2))}catch{}webpush.setVapidDetails("mailto:info@muslimpro-bastia.app",vapidKeys.publicKey,vapidKeys.privateKey);const FIREBASE_REGISTRY_DOC_ID="registry_index_v1";let firestoreDb=null;try{const fbConfigPath=path.resolve(__dirname,"firebase-applet-config.json");if(fs.existsSync(fbConfigPath)){const fbConfig=JSON.parse(fs.readFileSync(fbConfigPath,"utf8"));const fbApp=initializeApp(fbConfig,"server-push-scheduler");firestoreDb=getFirestore(fbApp,fbConfig.firestoreDatabaseId)}}catch(err){console.warn("Server Firebase initialization warning:",err)}const PUSH_SUBS_FILE=path.resolve(__dirname,".push-subscriptions.json");const pushSubscriptions=new Map;const watchedFirestoreDevices=new Set;function loadPushSubscriptions(){try{if(fs.existsSync(PUSH_SUBS_FILE)){const raw=JSON.parse(fs.readFileSync(PUSH_SUBS_FILE,"utf8"));if(Array.isArray(raw)){for(const item of raw){if(item&&item.subscription&&item.subscription.endpoint){if(item.deviceId){for(const[ep,s]of pushSubscriptions.entries()){if(s.deviceId===item.deviceId){pushSubscriptions.delete(ep);}}}pushSubscriptions.set(item.subscription.endpoint,{deviceId:item.deviceId,subscription:item.subscription,locationName:item.locationName||"Bastia Umbra",timezone:item.timezone||"Europe/Rome",athanVoice:item.athanVoice||"/audio/makkah.mp3",prayers:Array.isArray(item.prayers)?item.prayers:[],firedKeys:new Set(Array.isArray(item.firedKeys)?item.firedKeys:[])});}}}}}catch{}}__name(loadPushSubscriptions,"loadPushSubscriptions");function savePushSubscriptions(){try{const arr=Array.from(pushSubscriptions.values()).map(sub=>({deviceId:sub.deviceId,subscription:sub.subscription,locationName:sub.locationName,timezone:sub.timezone,athanVoice:sub.athanVoice,prayers:sub.prayers,firedKeys:Array.from(sub.firedKeys).slice(-40)}));fs.writeFileSync(PUSH_SUBS_FILE,JSON.stringify(arr,null,2))}catch{}}__name(savePushSubscriptions,"savePushSubscriptions");function ingestFirestoreDeviceDoc(data){if(!data||!data.deviceId||data.deviceId===FIREBASE_REGISTRY_DOC_ID)return;if(!data.fcmToken||typeof data.fcmToken!=="string")return;try{const parsedSub=JSON.parse(data.fcmToken);if(!parsedSub||!parsedSub.endpoint||!parsedSub.keys)return;const existing=pushSubscriptions.get(parsedSub.endpoint);const prayers=[{id:"Fajr",nameIt:"Fajr",nameAr:"\u0627\u0644\u0641\u062C\u0631",time:data.fajrTime||"05:20",alertMode:"sound"},{id:"Dhuhr",nameIt:"Dhuhr",nameAr:"\u0627\u0644\u0638\u0647\u0631",time:data.dhuhrTime||"13:10",alertMode:"sound"},{id:"Asr",nameIt:"Asr",nameAr:"\u0627\u0644\u0639\u0635\u0631",time:data.asrTime||"16:40",alertMode:"sound"},{id:"Maghrib",nameIt:"Maghrib",nameAr:"\u0627\u0644\u0645\u063A\u0631\u0628",time:data.maghribTime||"19:55",alertMode:"sound"},{id:"Isha",nameIt:"Isha",nameAr:"\u0627\u0644\u0639\u0634\u0627\u0621",time:data.ishaTime||"21:20",alertMode:"sound"}];if(data.deviceId){for(const[ep,s]of pushSubscriptions.entries()){if(s.deviceId===data.deviceId&&ep!==parsedSub.endpoint){pushSubscriptions.delete(ep);}}}pushSubscriptions.set(parsedSub.endpoint,{deviceId:data.deviceId,subscription:parsedSub,locationName:data.locationName||existing?.locationName||"Bastia Umbra",timezone:data.timezone||existing?.timezone||"Europe/Rome",athanVoice:data.athanVoice||existing?.athanVoice||"/audio/makkah.mp3",prayers,firedKeys:existing?.firedKeys||new Set});savePushSubscriptions()}catch{}}__name(ingestFirestoreDeviceDoc,"ingestFirestoreDeviceDoc");function watchFirestoreDevice(deviceId){if(!firestoreDb||!deviceId||deviceId===FIREBASE_REGISTRY_DOC_ID)return;if(watchedFirestoreDevices.has(deviceId))return;watchedFirestoreDevices.add(deviceId);try{getDoc(doc(firestoreDb,"prayerDevices",deviceId)).then(snap=>{if(snap&&snap.exists()){ingestFirestoreDeviceDoc(snap.data())}}).catch(()=>{})}catch{}}__name(watchFirestoreDevice,"watchFirestoreDevice");function startServerFirestoreSync(){if(!firestoreDb)return;try{getDoc(doc(firestoreDb,"prayerDevices",FIREBASE_REGISTRY_DOC_ID)).then(snap=>{if(!snap||!snap.exists())return;const rawList=snap.data()?.fcmToken;if(!rawList)return;try{const ids=JSON.parse(rawList);if(Array.isArray(ids)){for(const id of ids){if(typeof id==="string"){watchFirestoreDevice(id)}}}}catch{}}).catch(()=>{})}catch{}}__name(startServerFirestoreSync,"startServerFirestoreSync");async function persistSubscriptionToFirestore(deviceId,sub,locationName,timezone,athanVoice,prayers){if(!firestoreDb)return;const safeId=(deviceId||"dev_"+Date.now().toString(36)).replace(/[^a-zA-Z0-9_-]/g,"_").slice(0,120);const findTime=__name((id,fb)=>{const found=prayers.find(p=>p.id.toLowerCase()===id.toLowerCase());return String(found?.time||fb).slice(0,10)},"findTime");const payload={deviceId:safeId,locationName:(locationName||"Bastia Umbra").slice(0,120),timezone:(timezone||"Europe/Rome").slice(0,80),athanVoice:(athanVoice||"/audio/makkah.mp3").slice(0,200),fajrTime:findTime("Fajr","05:20"),dhuhrTime:findTime("Dhuhr","13:10"),asrTime:findTime("Asr","16:40"),maghribTime:findTime("Maghrib","19:55"),ishaTime:findTime("Isha","21:20"),fcmToken:JSON.stringify({endpoint:sub.endpoint,keys:sub.keys||{}}).slice(0,1024)};try{await setDoc(doc(firestoreDb,"prayerDevices",safeId),payload);watchFirestoreDevice(safeId);const regRef=doc(firestoreDb,"prayerDevices",FIREBASE_REGISTRY_DOC_ID);const snap=await getDoc(regRef).catch(()=>null);let list=[];if(snap&&snap.exists()&&snap.data()?.fcmToken){try{const parsed=JSON.parse(snap.data().fcmToken);if(Array.isArray(parsed))list=parsed.filter(x=>typeof x==="string")}catch{}}if(!list.includes(safeId)){list.push(safeId);if(list.length>25)list=list.slice(-25);await setDoc(regRef,{...payload,deviceId:FIREBASE_REGISTRY_DOC_ID,fcmToken:JSON.stringify(list).slice(0,1024)})}}catch(err){console.warn("Firestore server sync warning:",err)}}__name(persistSubscriptionToFirestore,"persistSubscriptionToFirestore");loadPushSubscriptions();startServerFirestoreSync();async function bootstrap(){const app=express();app.use((req, res, next) => { res.setHeader("Access-Control-Allow-Origin", "*"); res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE"); res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"); if (req.method === "OPTIONS") return res.sendStatus(204); next(); });app.use(express.json());const geminiApiKey=process.env.GEMINI_API_KEY||"";const ai=new GoogleGenAI({apiKey:geminiApiKey,httpOptions:{headers:{"User-Agent":"aistudio-build"}}});const ISLAMIC_SYSTEM_INSTRUCTION = `Sei l'assistente vocale e testuale islamico ufficiale (con voce maschile) di "Muslim Pro - Bastia (Warsh)".
Il tuo ruolo è guidare l'utente con saggezza (Hikmah), rispetto e totale aderenza alle fonti islamiche autentiche:
1. Il Sacro Corano (cita Sura e versetto, secondo la tradizione e lettura Warsh da Nafi').
2. La Sunnah autentica del Profeta Muhammad ﷺ (Sahih Al-Bukhari, Sahih Muslim, Muwatta dell'Imam Malik).
3. Il consenso dei sapienti (Ijma') e la scuola giuridica Maliki (المذهب المالكي) e le quattro scuole sunnite.
4. LINGUE SUPPORTATE (Italiano, Arabo الفصحى, e Dialetto Marocchino الدارجة المغربية / Darija):
   - Se l'utente scrive o parla in ITALIANO: rispondi in un Italiano chiaro, naturale e rispettoso.
   - Se l'utente scrive o parla in DIALETTO MAROCCHINO (الدارجة المغربية / Darija, sia in caratteri arabi come "كيفاش", "شنو", "واش", "بغيت", "ديال" sia in lettere latine come "kifach", "chno", "wach", "bghit"), oppure se la modalità selezionata è "darija": rispondi in autentica DARIJA MAROCCHINA (الدارجة المغربية) chiara, calorosa e rispettosa, citando i versetti coranici e gli hadith.
   - Se l'utente scrive o parla in ARABO STANDARD (العربية الفصحى): rispondi in Arabo الفصحى limpido ed eloquente.`;

app.options(["/api/gemini/chat", "/api/gemini/tts", "/api/gemini/transcribe"], (_req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.sendStatus(204);
});

app.post("/api/gemini/tts", express.json({ limit: "2mb" }), async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const { text } = req.body || {};
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Text is required" });
  }
  const cleanText = text.replace(/[*#_`~>]/g, " ").replace(/\s+/g, " ").trim().slice(0, 1800);
  const isArabicText = /[\u0600-\u06FF]/.test(cleanText);
  const voiceCandidates = ["Charon", "Fenrir", "Puck", "Zephyr"];
  for (const voiceName of voiceCandidates) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash-lite-tts",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: cleanText,
                speechMetadata: {
                  style: isArabicText
                    ? "Warm, wise, articulate Islamic male speaker with clear Arabic pronunciation"
                    : "Voce maschile italiana naturale, calda, chiara, cordiale e rispettosa con corretta dizione ed accenti italiani espressivi",
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });
      const inlineData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      if (inlineData?.data) {
        return res.json({
          audioBase64: inlineData.data,
          mimeType: inlineData.mimeType || "audio/wav",
          voice: voiceName,
        });
      }
    } catch (err) {
      console.warn(`TTS male voice ${voiceName} warning:`, err?.message || err);
    }
  }
  return res.status(500).json({ error: "TTS generation failed" });
});

app.post("/api/gemini/transcribe", express.json({ limit: "16mb" }), async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const { audioBase64, mimeType, language } = req.body || {};
  if (!audioBase64 || typeof audioBase64 !== "string") {
    return res.status(400).json({ error: "audioBase64 is required" });
  }
  const cleanMime = mimeType || (audioBase64.startsWith("GkXf") ? "audio/webm" : audioBase64.startsWith("//uQ") || audioBase64.startsWith("SUQz") ? "audio/mp3" : "audio/wav");
  const langHint =
    language === "darija"
      ? "Moroccan Arabic Darija (الدارجة المغربية), Standard Arabic, or Italian"
      : language === "ar"
      ? "Arabic (العربية الفصحى or الدارجة المغربية) or Italian"
      : "Italian (italiano con corretti accenti italiani: è, é, à, ò, ù, ì), Arabic (العربية), or Moroccan Darija (الدارجة المغربية)";
  const transcribeModels = ["gemini-3.5-transcribe", "gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.8-flash"];
  for (const mName of transcribeModels) {
    try {
      const response = await ai.models.generateContent({
        model: mName,
        contents: {
          parts: [
            { inlineData: { mimeType: cleanMime, data: audioBase64 } },
            { text: `Transcribe the spoken audio speech accurately and verbatim in ${langHint}. Keep natural Italian accents (è, é, à, ò, ù, ì) and apostrophes. Return ONLY the transcribed text without any extra quotes, notes, or commentary.` },
          ],
        },
      });
      let transcribed = "";
      if (response && typeof response.text === "string" && response.text.trim()) {
        transcribed = response.text.trim();
      }
      if (!transcribed && response.candidates?.[0]?.content?.parts) {
        for (const p of response.candidates[0].content.parts) {
          if (p.text) transcribed += p.text + " ";
          if (p.audioTranscription?.text) transcribed += p.audioTranscription.text + " ";
        }
        transcribed = transcribed.trim();
      }
      if (transcribed && transcribed.length > 0) {
        return res.json({ text: transcribed });
      }
    } catch (err) {
      console.warn(`Transcribe model ${mName} warning:`, err?.message || err);
    }
  }
  return res.status(500).json({ error: "Transcription failed" });
});
app.post("/api/gemini/chat",async(req,res)=>{res.setHeader("Access-Control-Allow-Origin","*");const prompt=typeof req.body?.prompt==="string"?req.body.prompt:typeof req.body?.message==="string"?req.body.message:null;const conversationHistory=req.body?.conversationHistory||req.body?.chatHistory||[];const language=req.body?.language||"it";const dialect=req.body?.dialect||"auto";if(!prompt){return res.status(400).json({error:"Prompt is required"})}try{if(!geminiApiKey){const fallbackMsg=language==="ar"?`\u0627\u0644\u0633\u0644\u0627\u0645 \u0639\u0644\u064A\u0643\u0645 \u0648\u0631\u062D\u0645\u0629 \u0627\u0644\u0644\u0647. \u0634\u0643\u0631\u0627\u064B \u0644\u0633\u0624\u0627\u0644\u0643. \u064A\u0631\u062C\u0649 \u062A\u0632\u0648\u064A\u062F \u0645\u0641\u062A\u0627\u062D Gemini API \u0641\u064A \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u0646\u0635\u0629 \u0644\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0645\u0628\u0627\u0634\u0631\u0629\u060C \u0648\u062A\u0630\u0643\u0631 \u0642\u0648\u0644 \u0627\u0644\u0644\u0647 \u062A\u0639\u0627\u0644\u0649: {\u0641\u064E\u0627\u0633\u0652\u0623\u064E\u0644\u064F\u0648\u0627 \u0623\u064E\u0647\u0652\u0644\u064E \u0627\u0644\u0630\u0650\u0651\u0643\u0652\u0631\u0650 \u0625\u0650\u0646 \u0643\u064F\u0646\u062A\u064F\u0645\u0652 \u0644\u064E\u0627 \u062A\u064E\u0639\u0652\u0644\u064E\u0645\u064F\u0648\u0646\u064E} [\u0627\u0644\u0646\u062D\u0644: 43].`:`As-salamu alaykum. Grazie per la tua domanda. Ricorda il nobile versetto del Sacro Corano: "Chiedete alla gente del Sapere, se non sapete" (Sura An-Nahl, 16:43). Configura la chiave Gemini per l'interazione AI in tempo reale.`;return res.json({reply:fallbackMsg})}const contents=[];if(Array.isArray(conversationHistory)){for(const item of conversationHistory.slice(-8)){contents.push({role:item.role==="assistant"?"model":"user",parts:[{text:item.content}]})}}const langDirective=dialect==="darija"?"[Nota: Se la domanda è in arabo/darija o non specifica altra lingua, rispondi in DARIJA MAROCCHINA (الدارجة المغربية) chiara e autentica]\n":dialect==="ar"?"[Nota: Rispondi nella lingua usata dall'utente: Arabo الفصحى, Darija Marocchina o Italiano]\n":"[Nota: Rispondi nella stessa lingua usata dall'utente: Italiano, Arabo الفصحى o Darija Marocchina (الدارجة المغربية)]\n";contents.push({role:"user",parts:[{text:langDirective+prompt}]});const candidateModels=["gemini-3.1-flash-lite","gemini-flash-latest","gemini-3.8-flash"];let responseText="";for(const modelName of candidateModels){try{const result=await ai.models.generateContent({model:modelName,contents,config:{systemInstruction:ISLAMIC_SYSTEM_INSTRUCTION,temperature:.35,maxOutputTokens:1200}});if(result&&result.text){responseText=result.text;break}}catch(err){console.warn(`Model ${modelName} failed, trying next candidate. Error:`,err?.message||err)}}if(!responseText){const fallbackIslamicText=language==="ar"?`\u0627\u0644\u0633\u0644\u0627\u0645 \u0639\u0644\u064A\u0643\u0645 \u0648\u0631\u062D\u0645\u0629 \u0627\u0644\u0644\u0647 \u0648\u0628\u0631\u0643\u0627\u062A\u0647.

\u062A\u0646\u0628\u064A\u0647 \u062A\u0642\u0646\u064A: \u062A\u0645 \u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u062D\u062F \u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u0645\u0624\u0642\u062A (Quota Limit) \u0644\u062E\u0627\u062F\u0645 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A.

\u062A\u0630\u0643\u064A\u0631 \u0625\u064A\u0645\u0627\u0646\u064A: \u0642\u0627\u0644 \u0627\u0644\u0644\u0647 \u062A\u0639\u0627\u0644\u0649: {\u0641\u064E\u0627\u0633\u0652\u0623\u064E\u0644\u064F\u0648\u0627 \u0623\u064E\u0647\u0652\u0644\u064E \u0627\u0644\u0630\u0650\u0651\u0643\u0652\u0631\u0650 \u0625\u0650\u0646 \u0643\u064F\u0646\u062A\u064F\u0645\u0652 \u0644\u064E\u0627 \u062A\u064E\u0639\u0652\u0644\u064E\u0645\u064F\u0648\u0646\u064E} [\u0627\u0644\u0646\u062D\u0644: 43]. \u064A\u0645\u0643\u0646\u0643 \u062A\u0635\u0641\u062D \u0627\u0644\u0645\u0635\u062D\u0641 \u0627\u0644\u0634\u0631\u064A\u0641 \u0628\u0631\u0648\u0627\u064A\u0629 \u0648\u0631\u0634\u060C \u0648\u0623\u0648\u0642\u0627\u062A \u0627\u0644\u0635\u0644\u0627\u0629\u060C \u0648\u0627\u0644\u0623\u0630\u0643\u0627\u0631 \u0648\u0627\u0644\u0623\u062D\u0627\u062F\u064A\u062B \u0627\u0644\u0635\u062D\u064A\u062D\u0629 \u0627\u0644\u0645\u062A\u0648\u0641\u0631\u0629 \u0628\u0627\u0644\u0643\u0627\u0645\u0644 \u062F\u0627\u062E\u0644 \u0627\u0644\u062A\u0637\u0628\u064A\u0642 \u0625\u0644\u0649 \u062D\u064A\u0646 \u062A\u062C\u062F\u062F \u0627\u0644\u062D\u0635\u0629 \u0627\u0644\u064A\u0648\u0645\u064A\u0629.`:`As-salamu alaykum wa rahmatullahi wa barakatuh.

Nota: La quota temporanea del servizio Gemini \xE8 momentaneamente esaurita per oggi (Rate Limit).

Consiglio: Nel Sacro Corano Allah l'Altissimo dice: \xABChiedete alla gente del Sapere, se non sapete\xBB (Sura An-Nahl, 16:43). Nel frattempo, puoi continuare a utilizzare liberamente il Mushaf con lettura Warsh, gli orari di preghiera di Bastia, la Qibla e le invocazioni (Adhkar) interamente offline.`;return res.json({reply:fallbackIslamicText})}return res.json({reply:responseText})}catch(err){console.error("Error querying Gemini API:",err);const isArabic=language==="ar";return res.status(500).json({error:"Failed to generate response",reply:isArabic?"\u062D\u062F\u062B \u062E\u0637\u0623 \u0645\u0624\u0642\u062A \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0645\u0633\u0627\u0639\u062F \u062C\u064A\u0645\u064A\u0646\u064A. \u064A\u0631\u062C\u0649 \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0628\u0639\u062F \u0644\u062D\u0638\u0627\u062A.":"Si \xE8 verificato un errore temporaneo durante la risposta di Gemini. Riprova tra poco."})}});app.post("/api/quran/asbab-tafsir",async(req,res)=>{const{surahNumber,ayahNumber,surahName,ayahText}=req.body;if(!surahNumber||!ayahNumber){return res.status(400).json({error:"surahNumber and ayahNumber are required"})}try{if(!geminiApiKey){return res.json({asbabAr:`\u0646\u0632\u0644 \u0647\u0630\u0627 \u0627\u0644\u0648\u062D\u064A \u0627\u0644\u0645\u0628\u0627\u0631\u0643 \u0645\u0646 \u0633\u0648\u0631\u0629 ${surahName||surahNumber} \u0644\u0647\u062F\u0627\u064A\u0629 \u0627\u0644\u0642\u0644\u0648\u0628 \u0648\u062A\u062B\u0628\u064A\u062A \u0627\u0644\u0625\u064A\u0645\u0627\u0646. \u0623\u0648\u0631\u062F \u0627\u0644\u0625\u0645\u0627\u0645 \u0627\u0644\u0633\u064A\u0648\u0637\u064A \u0641\u064A "\u0644\u0628\u0627\u0628 \u0627\u0644\u0646\u0642\u0648\u0644" \u0648\u0627\u0644\u0625\u0645\u0627\u0645 \u0627\u0644\u0648\u0627\u062D\u062F\u064A \u0641\u064A "\u0623\u0633\u0628\u0627\u0628 \u0627\u0644\u0646\u0632\u0648\u0644" \u0627\u0644\u0631\u0648\u0627\u064A\u0627\u062A \u0627\u0644\u0635\u062D\u064A\u062D\u0629 \u0627\u0644\u0648\u0627\u0631\u062F\u0629 \u0641\u064A \u0627\u0644\u0639\u0647\u062F\u064A\u0646 \u0627\u0644\u0645\u0643\u064A \u0648\u0627\u0644\u0645\u062F\u0646\u064A.`,asbabIt:`Rivelato per istruire i cuori e stabilire la saldezza della fede. Le fonti classiche di riferimento sono 'Asbab al-Nuzul' di Al-Wahidi e 'Lubab al-Nuqul' di As-Suyuti.`,tafsirAr:`\u062A\u0641\u0633\u064A\u0631 \u0627\u0644\u0622\u064A\u0629 ${ayahNumber} \u0645\u0646 \u0633\u0648\u0631\u0629 ${surahName}: \u062A\u0648\u062C\u064A\u0647 \u0625\u0644\u0647\u064A \u0643\u0631\u064A\u0645 \u064A\u062F\u0639\u0648 \u0625\u0644\u0649 \u0627\u0644\u062A\u062F\u0628\u0631 \u0648\u0627\u0644\u0639\u0645\u0644 \u0628\u0627\u0644\u0642\u0631\u0622\u0646 \u0627\u0644\u0643\u0631\u064A\u0645.`,tafsirIt:`Commento del versetto ${ayahNumber}: profonda esortazione spirituale e guida morale tratta dal Sacro Corano.`})}const prompt=`Fornisci le 'Asbab an-Nuzul' (\u0623\u0633\u0628\u0627\u0628 \u0627\u0644\u0646\u0632\u0648\u0644 - Causa e circostanze storiche della rivelazione) e un compendio di Tafsir per:
Sura: ${surahName} (Numero ${surahNumber}), Versetto: ${ayahNumber}.
Testo del versetto: "${ayahText||""}".

Fonti da consultare:
- 'Asbab al-Nuzul' dell'Imam Al-Wahidi (\u0623\u0633\u0628\u0627\u0628 \u0627\u0644\u0646\u0632\u0648\u0644 \u0644\u0644\u0648\u0627\u062D\u062F\u064A)
- 'Lubab al-Nuqul fi Asbab an-Nuzul' dell'Imam As-Suyuti (\u0644\u0628\u0627\u0628 \u0627\u0644\u0646\u0642\u0648\u0644 \u0641\u064A \u0623\u0633\u0628\u0627\u0628 \u0627\u0644\u0646\u0632\u0648\u0644 \u0644\u0644\u0633\u064A\u0648\u0637\u064A)
- Tafsir Ibn Kathir e Tafsir Al-Muyassar.

Rispondi ESCLUSIVAMENTE in formato JSON con questi 4 campi:
{
  "asbabAr": "\u0627\u0644\u0646\u0635 \u0627\u0644\u0639\u0631\u0628\u064A \u0644\u0633\u0628\u0628 \u0648\u0633\u064A\u0627\u0642 \u0627\u0644\u0646\u0632\u0648\u0644 \u0645\u0646 \u0627\u0644\u0648\u0627\u062D\u062F\u064A \u0623\u0648 \u0627\u0644\u0633\u064A\u0648\u0637\u064A \u0645\u0639 \u0639\u0632\u0648 \u0627\u0644\u0631\u0648\u0627\u064A\u0629",
  "asbabIt": "Spiegazione chiara e accurata in italiano dell'occasione e del contesto storico della rivelazione",
  "tafsirAr": "\u062A\u0641\u0633\u064A\u0631 \u0645\u064A\u0633\u0631 \u0648\u062F\u0642\u064A\u0642 \u0644\u0644\u0622\u064A\u0629 \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629",
  "tafsirIt": "Sintesi chiara ed esplicativa del significato del versetto in italiano"
}`;const candidateModels=["gemini-3.1-flash-lite","gemini-flash-latest","gemini-3.8-flash"];let raw="";for(const modelName of candidateModels){try{const result=await ai.models.generateContent({model:modelName,contents:[{role:"user",parts:[{text:prompt}]}],config:{systemInstruction:"Sei uno studioso esperto di Ulum al-Quran, Asbab an-Nuzul e Tafsir classico. Rispondi solo in JSON valido.",temperature:.2,responseMimeType:"application/json"}});if(result&&result.text){raw=result.text;break}}catch{}}if(!raw){return res.json({asbabAr:`\u0646\u0632\u0644 \u0647\u0630\u0627 \u0627\u0644\u0648\u062D\u064A \u0627\u0644\u0643\u0631\u064A\u0645 \u0645\u0646 \u0633\u0648\u0631\u0629 ${surahName||surahNumber} \u0641\u064A \u0633\u064A\u0627\u0642 \u0647\u062F\u0627\u064A\u0629 \u0627\u0644\u062E\u0644\u0642 \u0648\u062A\u062B\u0628\u064A\u062A \u0627\u0644\u0645\u0624\u0645\u0646\u064A\u0646\u060C \u0648\u0641\u0642 \u0645\u0627 \u0628\u064A\u0651\u0646\u0647 \u0627\u0644\u0625\u0645\u0627\u0645 \u0627\u0644\u0648\u0627\u062D\u062F\u064A \u0641\u064A \u0623\u0633\u0628\u0627\u0628 \u0627\u0644\u0646\u0632\u0648\u0644.`,asbabIt:`Rivelato nel contesto della guida divina e del consolidamento della fede, secondo quanto documentato da Al-Wahidi e As-Suyuti.`,tafsirAr:`\u062A\u0641\u0633\u064A\u0631 \u0627\u0644\u0622\u064A\u0629 ${ayahNumber} \u0645\u0646 \u0633\u0648\u0631\u0629 ${surahName}: \u0628\u064A\u0627\u0646 \u0642\u0631\u0622\u0646\u064A \u062C\u0644\u064A\u0644 \u064A\u0631\u0634\u062F \u0625\u0644\u0649 \u0627\u0644\u0627\u0633\u062A\u0642\u0627\u0645\u0629 \u0648\u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u0635\u0627\u0644\u062D.`,tafsirIt:`Commento del versetto ${ayahNumber}: profondo insegnamento per illuminare la condotta del credente.`})}const parsed=JSON.parse(raw);return res.json(parsed)}catch(err){console.warn("Asbab API error:",err);return res.json({asbabAr:`\u0646\u0632\u0644 \u0647\u0630\u0627 \u0627\u0644\u0648\u062D\u064A \u0627\u0644\u0645\u0628\u0627\u0631\u0643 \u0645\u0646 \u0633\u0648\u0631\u0629 ${surahName||surahNumber} \u0641\u064A \u0633\u064A\u0627\u0642 \u0647\u062F\u0627\u064A\u0629 \u0627\u0644\u062E\u0644\u0642 \u0648\u062A\u062B\u0628\u064A\u062A \u0627\u0644\u0645\u0624\u0645\u0646\u064A\u0646\u060C \u0648\u0641\u0642 \u0645\u0627 \u0628\u064A\u0651\u0646\u0647 \u0627\u0644\u0625\u0645\u0627\u0645 \u0627\u0644\u0648\u0627\u062D\u062F\u064A \u0641\u064A \u0623\u0633\u0628\u0627\u0628 \u0627\u0644\u0646\u0632\u0648\u0644.`,asbabIt:`Rivelato nel contesto della guida divina e del consolidamento della fede, secondo quanto documentato da Al-Wahidi e As-Suyuti.`})}});app.get("/api/push/vapid-public-key",(_req,res)=>{res.json({publicKey:vapidKeys.publicKey})});app.post("/api/push/subscribe",async(req,res)=>{const{deviceId,subscription,prayers,locationName,timezone,athanVoice,sendWelcome}=req.body||{};if(!subscription||!subscription.endpoint){return res.status(400).json({error:"Invalid push subscription"})}const existing=pushSubscriptions.get(subscription.endpoint);const resolvedDeviceId=deviceId||existing?.deviceId;const resolvedLocation=locationName||existing?.locationName||"Bastia Umbra";const resolvedTz=timezone||existing?.timezone||"Europe/Rome";const resolvedVoice=athanVoice||existing?.athanVoice||"/audio/makkah.mp3";const resolvedPrayers=Array.isArray(prayers)&&prayers.length>0?prayers:existing?.prayers||[];if(resolvedDeviceId){for(const[ep,item]of pushSubscriptions.entries()){if(ep!==subscription.endpoint&&item.deviceId===resolvedDeviceId){pushSubscriptions.delete(ep)}}}pushSubscriptions.set(subscription.endpoint,{deviceId:resolvedDeviceId,subscription,locationName:resolvedLocation,timezone:resolvedTz,athanVoice:resolvedVoice,prayers:resolvedPrayers,firedKeys:existing?.firedKeys||new Set});savePushSubscriptions();persistSubscriptionToFirestore(resolvedDeviceId||"dev_web",subscription,resolvedLocation,resolvedTz,resolvedVoice,resolvedPrayers).catch(()=>{});if(sendWelcome){const payload=JSON.stringify({title:"\u{1F54C} \u062D\u0627\u0646 \u0627\u0644\u0622\u0646 \u0648\u0642\u062A \u0627\u0644\u0635\u0644\u0627\u0629 \u2022 Notifiche Firebase & Push Attive!",body:`Riceverai l'Adhan e le notifiche per ${resolvedLocation} anche ad app chiusa e telefono in standby.`,tag:"prayer-adhan-alarm",athanVoice:resolvedVoice});try{await webpush.sendNotification(subscription,payload,{urgency:"high",TTL:3600})}catch(e){console.warn("Welcome push send warning:",e?.statusCode||e);if(e?.statusCode>=400){pushSubscriptions.delete(subscription.endpoint);savePushSubscriptions();return res.json({ok:false,needResubscribe:true})}}}return res.json({ok:true,count:pushSubscriptions.size,firebaseSynced:Boolean(firestoreDb)})});app.options("/api/admin/broadcast-push",(_req,res)=>{res.setHeader("Access-Control-Allow-Origin","*");res.setHeader("Access-Control-Allow-Methods","POST, OPTIONS");res.setHeader("Access-Control-Allow-Headers","Content-Type");res.sendStatus(204)});app.post("/api/admin/broadcast-push",async(req,res)=>{res.setHeader("Access-Control-Allow-Origin","*");const{title,body,category}=req.body||{};if(!title||!body){return res.status(400).json({error:"Title and body are required"})}const cleanTitle=String(title).slice(0,150);const cleanBody=String(body).slice(0,500);const payload=JSON.stringify({title:`\u{1F4E2} ${cleanTitle}`,body:cleanBody,tag:"community-alert-alarm",category:category||"general",url:"/?tab=community"});let sent=0,failed=0;for(const[endpoint,subData]of pushSubscriptions.entries()){try{await webpush.sendNotification(subData.subscription,payload,{urgency:"high",TTL:86400});sent++}catch(err){failed++;if(err?.statusCode===404||err?.statusCode===410){pushSubscriptions.delete(endpoint)}}}savePushSubscriptions();return res.json({ok:true,sent,failed,totalTargets:pushSubscriptions.size})});const dispatchedTestIds=new Set;app.post("/api/push/test",async(req,res)=>{const{testId,deviceId,subscription,delaySeconds,title,body,locationName,athanVoice}=req.body||{};const resolvedTestId=String(testId||`test_${deviceId||"anon"}_${Date.now()}`);const getCurrentPrayerIdForNow=()=>{const now=new Date();const mins=now.getHours()*60+now.getMinutes();if(mins>=4*60&&mins<7*60)return"Fajr";if(mins>=7*60&&mins<15*60+30)return"Dhuhr";if(mins>=15*60+30&&mins<19*60)return"Asr";if(mins>=19*60&&mins<20*60+45)return"Maghrib";return"Isha"};const targetPrayerId = (req.body?.prayerId && String(req.body.prayerId).toLowerCase() !== "prayerid") ? String(req.body.prayerId) : getCurrentPrayerIdForNow();
const pNameArMap = { Fajr: "\u0627\u0644\u0641\u062C\u0631", Dhuhr: "\u0627\u0644\u0638\u0647\u0631", Asr: "\u0627\u0644\u0639\u0635\u0631", Maghrib: "\u0627\u0644\u0645\u063A\u0631\u0628", Isha: "\u0627\u0644\u0639\u0634\u0627\u0621" };
const resolvedPNameAr = pNameArMap[targetPrayerId] || targetPrayerId;
const notifTitle=title||`\u{1F54C} \u0635\u0644\u0627\u0629 ${resolvedPNameAr} \u2022 ${locationName||"Bastia Umbra"}`;
const notifBody=body||`\u062D\u0627\u0646 \u0627\u0644\u0622\u0646 \u0648\u0642\u062A \u0627\u0644\u0635\u0644\u0627\u0629 (${targetPrayerId}) \u2022 \xC8 entrato il tempo della preghiera.`;
const payload=JSON.stringify({title:notifTitle,body:notifBody,tag:"prayer-adhan-alarm",prayerId:targetPrayerId,athanVoice:athanVoice||"/audio/makkah.mp3"});if(subscription&&subscription.endpoint){const existing=pushSubscriptions.get(subscription.endpoint);const resolvedDeviceId=deviceId||existing?.deviceId;const resolvedLocation=locationName||existing?.locationName||"Bastia Umbra";const resolvedTz=existing?.timezone||"Europe/Rome";const resolvedVoice=athanVoice||existing?.athanVoice||"/audio/makkah.mp3";const resolvedPrayers=existing?.prayers||[];if(resolvedDeviceId){for(const[ep,item]of pushSubscriptions.entries()){if(ep!==subscription.endpoint&&item.deviceId===resolvedDeviceId){pushSubscriptions.delete(ep)}}}pushSubscriptions.set(subscription.endpoint,{deviceId:resolvedDeviceId,subscription,locationName:resolvedLocation,timezone:resolvedTz,athanVoice:resolvedVoice,prayers:resolvedPrayers,firedKeys:existing?.firedKeys||new Set});savePushSubscriptions();persistSubscriptionToFirestore(resolvedDeviceId||"dev_web",subscription,resolvedLocation,resolvedTz,resolvedVoice,resolvedPrayers).catch(()=>{})}const getActiveTargets=__name(async()=>{if(subscription&&subscription.endpoint){return[subscription]}const targets=[];const seenDevices=new Set;for(const item of pushSubscriptions.values()){if(deviceId&&item.deviceId&&item.deviceId!==deviceId)continue;const devKey=item.deviceId||item.subscription.endpoint;if(!seenDevices.has(devKey)){seenDevices.add(devKey);targets.push(item.subscription)}}if(targets.length===0&&firestoreDb&&deviceId){try{const snap=await getDoc(doc(firestoreDb,"prayerDevices",String(deviceId)));if(snap.exists()&&snap.data()?.fcmToken){const parsed=JSON.parse(snap.data().fcmToken);if(parsed&&parsed.endpoint){targets.push(parsed);ingestFirestoreDeviceDoc(snap.data())}}}catch{}}if(targets.length===0){for(const item of pushSubscriptions.values()){targets.push(item.subscription);break}}return targets},"getActiveTargets");const sendToTargets=__name(async()=>{if(dispatchedTestIds.has(resolvedTestId)){return{sent:1,failed:0}}dispatchedTestIds.add(resolvedTestId);const targets=await getActiveTargets();let sent2=0;let failed2=0;for(const sub of targets){try{await webpush.sendNotification(sub,payload,{urgency:"high",TTL:86400});sent2++}catch(err){failed2++;if(err?.statusCode===404||err?.statusCode===410){pushSubscriptions.delete(sub.endpoint);savePushSubscriptions()}}}return{sent:sent2,failed:failed2}},"sendToTargets");const delaySec=Math.min(Math.max(Number(delaySeconds)||0,0),120);if(delaySec>0){setTimeout(()=>{sendToTargets().catch(()=>{})},delaySec*1e3);await new Promise(resolve=>setTimeout(resolve,delaySec*1e3));const{sent:sent2,failed:failed2}=await sendToTargets();return res.json({ok:true,scheduledInSeconds:delaySec,sent:sent2,failed:failed2,targetsCount:pushSubscriptions.size||1})}const{sent,failed}=await sendToTargets();return res.json({ok:true,sent,needResubscribe:sent===0&&failed>0})});let isCheckingPushes=false;const devicePrayerDispatched=new Map;const checkAndSendDuePrayerPushes=__name(async()=>{if(isCheckingPushes||pushSubscriptions.size===0)return;isCheckingPushes=true;try{const now=new Date;if(devicePrayerDispatched.size>500){const cutoff=Date.now()-864e5;for(const[k,ts]of devicePrayerDispatched.entries()){if(ts<cutoff)devicePrayerDispatched.delete(k);}}for(const[endpoint,subData]of pushSubscriptions.entries()){const tz=subData.timezone||"Europe/Rome";let currentTotalMinutes=now.getHours()*60+now.getMinutes();let dateKey=`${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;try{const timeStr=new Intl.DateTimeFormat("en-GB",{timeZone:tz,hour:"2-digit",minute:"2-digit",hour12:false}).format(now);const[th,tm]=timeStr.split(":").map(n=>parseInt(n,10));if(!isNaN(th)&&!isNaN(tm)){currentTotalMinutes=th*60+tm}dateKey=new Intl.DateTimeFormat("en-CA",{timeZone:tz,year:"numeric",month:"2-digit",day:"2-digit"}).format(now);}catch{}let activePrayers=subData.prayers;try{const matchedLoc=DEFAULT_LOCATIONS.find(l=>l.name.toLowerCase()===(subData.locationName||"").toLowerCase())||DEFAULT_LOCATIONS[0];const calculatedToday=getPrayerTimesForDate(now,matchedLoc,"UOIF");activePrayers=calculatedToday.map(cp=>{const savedPrayer=Array.isArray(subData.prayers)?subData.prayers.find(sp=>sp.id===cp.id):void 0;return{id:cp.id,nameIt:cp.nameIt,nameAr:cp.nameAr,time:savedPrayer?.time||cp.time,alertMode:savedPrayer?.alertMode||"sound"};});}catch{}for(let idx=0;idx<activePrayers.length;idx++){const p=activePrayers[idx];if(!p||!p.time||p.id==="Sunrise"||p.alertMode==="mute")continue;const[hStr,mStr]=String(p.time).split(":");const pMins=parseInt(hStr,10)*60+parseInt(mStr,10);const diff=currentTotalMinutes-pMins;if(diff>=0&&diff<=2){const devKey=String(subData.deviceId||endpoint);const dispatchKey=`${devKey}_${dateKey}_${p.id}`;if(devicePrayerDispatched.has(dispatchKey))continue;const key=`${dateKey}_${p.id}_${p.time}`;if(!subData.firedKeys.has(key)){devicePrayerDispatched.set(dispatchKey,Date.now());subData.firedKeys.add(key);savePushSubscriptions();const payload=JSON.stringify({title:`\u{1F54C} \u0635\u0644\u0627\u0629 ${p.nameAr||""} \u2022 ${p.nameIt||p.id}`,body:`\u062D\u0627\u0646 \u0627\u0644\u0622\u0646 \u0648\u0642\u062A \u0627\u0644\u0635\u0644\u0627\u0629 (${p.time}) \u2022 ${subData.locationName}`,tag:"prayer-adhan-alarm",prayerId:p.id,prayerName:p.nameIt,prayerIndex:idx,athanVoice:p.id==="Fajr"?"/audio/fajr.mp3":subData.athanVoice});try{await webpush.sendNotification(subData.subscription,payload,{urgency:"high",TTL:300});}catch(err){if(err?.statusCode===404||err?.statusCode===410){pushSubscriptions.delete(endpoint);savePushSubscriptions();}}}}}}}finally{isCheckingPushes=false;}},"checkAndSendDuePrayerPushes");setInterval(checkAndSendDuePrayerPushes,15e3);app.get("/api/keepalive-pulse",async(_req,res)=>{res.setHeader("Cache-Control","no-cache, no-store");await checkAndSendDuePrayerPushes();res.json({ok:true,activeSubscribers:pushSubscriptions.size,ts:Date.now()})});app.get(["/api/prayer-alarms.ics","/prayer-alarms.ics"],(req,res)=>{const cityQuery=String(req.query.city||"Bastia Umbra").trim();const matchedLoc=DEFAULT_LOCATIONS.find(l=>l.name.toLowerCase()===cityQuery.toLowerCase())||DEFAULT_LOCATIONS[0];const tz=matchedLoc.timezone||"Europe/Rome";const now=new Date;const dtStamp=now.toISOString().replace(/[-:]/g,"").split(".")[0]+"Z";const lines=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Muslim Pro Bastia//Orari Preghiere & Sveglia Adhan//IT","CALSCALE:GREGORIAN","METHOD:PUBLISH",`X-WR-CALNAME:\u{1F54C} Orari Preghiere (${matchedLoc.name})`,`X-WR-TIMEZONE:${tz}`,"X-WR-CALDESC:Sveglie automatiche per le 5 Preghiere quotidiane (Fajr, Dhuhr, Asr, Maghrib, Isha) anche ad app chiusa e offline.","REFRESH-INTERVAL;VALUE=DURATION:PT12H","X-PUBLISHED-TTL:PT12H"];for(let dayOffset=0;dayOffset<30;dayOffset++){const targetDate=new Date(now.getTime()+dayOffset*864e5);const y=targetDate.getFullYear();const m=String(targetDate.getMonth()+1).padStart(2,"0");const d=String(targetDate.getDate()).padStart(2,"0");const prayers=getPrayerTimesForDate(targetDate,matchedLoc,"UOIF");for(const p of prayers){if(p.id==="Sunrise")continue;const[hh,mm]=p.time.split(":").map(s=>s.padStart(2,"0"));const dtStart=`${y}${m}${d}T${hh}${mm}00`;const endMin=(parseInt(mm,10)+15)%60;const endHr=(parseInt(hh,10)+Math.floor((parseInt(mm,10)+15)/60))%24;const dtEnd=`${y}${m}${d}T${String(endHr).padStart(2,"0")}${String(endMin).padStart(2,"0")}00`;const uid=`prayer-${p.id.toLowerCase()}-${y}${m}${d}-${matchedLoc.id}@muslimpro-bastia.app`;lines.push("BEGIN:VEVENT",`UID:${uid}`,`DTSTAMP:${dtStamp}`,`DTSTART;TZID=${tz}:${dtStart}`,`DTEND;TZID=${tz}:${dtEnd}`,`SUMMARY:\u{1F54C} \u0635\u0644\u0627\u0629 ${p.nameAr} \u2022 ${p.nameIt} (${p.time})`,`DESCRIPTION:\u062D\u0627\u0646 \u0627\u0644\u0622\u0646 \u0648\u0642\u062A \u0635\u0644\u0627\u0629 ${p.nameAr} (${p.nameIt}) \u0641\u064A ${matchedLoc.name}. Apri Muslim Pro per ascoltare l'Adhan.`,`LOCATION:${matchedLoc.name}`,"STATUS:CONFIRMED","TRANSP:TRANSPARENT","BEGIN:VALARM","TRIGGER:PT0S","ACTION:DISPLAY",`DESCRIPTION:\u{1F54C} \u062D\u0627\u0646 \u0627\u0644\u0622\u0646 \u0648\u0642\u062A \u0635\u0644\u0627\u0629 ${p.nameAr} \u2022 Ora di ${p.nameIt} (${p.time})`,"END:VALARM","BEGIN:VALARM","TRIGGER:PT0S","ACTION:AUDIO","END:VALARM","END:VEVENT")}}lines.push("END:VCALENDAR");res.setHeader("Content-Type","text/calendar; charset=utf-8");res.setHeader("Content-Disposition",`inline; filename="orari-preghiere-${matchedLoc.id}.ics"`);res.setHeader("Cache-Control","no-cache");res.send(lines.join("\r\n"))});app.options("/api/ota-status",(_req,res)=>{res.setHeader("Access-Control-Allow-Origin","*");res.setHeader("Access-Control-Allow-Methods","GET, OPTIONS");res.setHeader("Access-Control-Allow-Headers","Content-Type");res.sendStatus(204)});app.get("/api/ota-status",(req,res)=>{res.setHeader("Access-Control-Allow-Origin","*");res.setHeader("Cache-Control","no-cache, no-store, must-revalidate");let latestMtime=17278e8;const filesToWatch=[path.resolve(__dirname,"src","App.tsx"),path.resolve(__dirname,"src","utils","prayerNotifications.ts"),path.resolve(__dirname,"public","sw.js"),path.resolve(__dirname,"server.ts")];for(const fp of filesToWatch){try{const st=fs.statSync(fp);if(st.mtimeMs>latestMtime){latestMtime=Math.floor(st.mtimeMs)}}catch{}}const buildId=`ota_${latestMtime}`;const proto=req.headers["x-forwarded-proto"]||req.protocol||"https";const host=req.headers["x-forwarded-host"]||req.headers.host;const rawHost=host?String(host).split(",")[0].trim():"ais-dev-jagwvklisthsahvfn7hafv-666421148062.europe-west1.run.app";const liveUrl=`${proto.split(",")[0].trim()}://${rawHost}`;res.json({ok:true,buildId,version:"30.0-OTA",liveUrl,titleIt:"\u{1F680} Aggiornamento OTA Disponibile",messageIt:"Nuova versione pronta per Android APK & iOS! Tocca \xABAggiorna Ora\xBB per applicare subito le novit\xE0 senza disinstallare l'app."})});app.get("/api/prayer-stream",(req,res)=>{res.setHeader("Content-Type","text/event-stream");res.setHeader("Cache-Control","no-cache, no-transform");res.setHeader("Connection","keep-alive");res.setHeader("X-Accel-Buffering","no");res.flushHeaders?.();const sendHeartbeat=__name(()=>{try{res.write(`data: ${JSON.stringify({type:"HEARTBEAT",ts:Date.now()})}

`)}catch{}},"sendHeartbeat");sendHeartbeat();const timer=setInterval(sendHeartbeat,5e3);req.on("close",()=>{clearInterval(timer)})});app.get(["/sw.js","/firebase-messaging-sw.js"],(req,res)=>{const fileName=req.path.replace(/^\//,"");res.setHeader("Content-Type","application/javascript; charset=utf-8");res.setHeader("Service-Worker-Allowed","/");res.setHeader("Cache-Control","no-cache, no-store, must-revalidate");res.sendFile(path.resolve(__dirname,"public",fileName))});app.get(["/icon-192.png","/icon-512.png","/icon.png","/apple-touch-icon.png","/favicon.ico","/icon.svg"],(req,res)=>{const fileName=req.path.replace(/^\//,"");res.setHeader("Cache-Control","no-cache, no-store, must-revalidate");res.sendFile(path.resolve(__dirname,"public",fileName))});app.get(["/warsh-p001.webp","/warsh-p002.webp"],(req,res)=>{const fileName=req.path.replace(/^\//,"");res.setHeader("Content-Type","image/webp");res.setHeader("Cache-Control","public, max-age=86400");res.sendFile(path.resolve(__dirname,"public",fileName))});app.get(["/kaaba-bg.jpg","/src/assets/images/makkah_holy_kaaba_1790568115282.jpg"],(req,res)=>{if(req.url.includes("import")){res.setHeader("Content-Type","application/javascript; charset=utf-8");res.send('export default "/kaaba-bg.jpg";');return}res.setHeader("Content-Type","image/jpeg");res.setHeader("Cache-Control","public, max-age=86400");res.sendFile(path.resolve(__dirname,"public","kaaba-bg.jpg"))});app.get(["/quran-bg.jpg","/src/assets/images/quran_islamic_art_1790568125598.jpg"],(req,res)=>{if(req.url.includes("import")){res.setHeader("Content-Type","application/javascript; charset=utf-8");res.send('export default "/quran-bg.jpg";');return}res.setHeader("Content-Type","image/jpeg");res.setHeader("Cache-Control","public, max-age=86400");res.sendFile(path.resolve(__dirname,"public","quran-bg.jpg"))});app.get(["/MuslimPro-Warsh.apk","/MuslimPro-Warsh-v26.apk","/MuslimPro-Warsh-v29.apk","/MuslimPro-Warsh-v30.apk","/MuslimPro-Warsh-v31.apk","/MuslimPro-Warsh-v32.apk","/MuslimPro-Warsh-v33.apk","/MuslimPro-Warsh-v34.apk","/MuslimPro-Warsh-v35.apk","/MuslimPro-Warsh-v36.apk","/api/download/android-apk"],(_req,res)=>{const apkPath=path.resolve(__dirname,"public","MuslimPro-Warsh.apk");try{const stat=fs.statSync(apkPath);res.setHeader("Content-Length",String(stat.size))}catch{}res.setHeader("Content-Type","application/vnd.android.package-archive");res.setHeader("Content-Disposition",'attachment; filename="MuslimPro-Warsh.apk"');res.setHeader("Cache-Control","no-cache, no-store, must-revalidate");res.sendFile(apkPath)});app.get(["/MuslimPro-Warsh.mobileconfig","/api/download/ios-app"],(req,res)=>{const configPath=path.resolve(__dirname,"public","MuslimPro-Warsh.mobileconfig");try{let xml=fs.readFileSync(configPath,"utf8");const proto=req.headers["x-forwarded-proto"]||req.protocol||"https";const host=req.headers["x-forwarded-host"]||req.headers.host;if(host){const rawHost=String(host).split(",")[0].trim();const liveOrigin=`${proto.split(",")[0].trim()}://${rawHost}`;xml=xml.replace(/https:\/\/ais-[a-z0-9-]+\.europe-west1\.run\.app/g,liveOrigin)}const buf=Buffer.from(xml,"utf8");res.setHeader("Content-Type","application/x-apple-aspen-config");res.setHeader("Content-Disposition",'inline; filename="MuslimPro-Warsh-iOS.mobileconfig"');res.setHeader("Content-Length",String(buf.length));res.setHeader("Cache-Control","no-cache, no-store, must-revalidate");res.send(buf)}catch{res.setHeader("Content-Type","application/x-apple-aspen-config");res.setHeader("Content-Disposition",'inline; filename="MuslimPro-Warsh-iOS.mobileconfig"');res.sendFile(configPath)}});app.get("/manifest.json",(_req,res)=>{res.setHeader("Content-Type","application/manifest+json; charset=utf-8");res.setHeader("Cache-Control","no-cache");res.sendFile(path.resolve(__dirname,"public","manifest.json"))});app.get(["/adhan.mp3","/audio/:voice"],(_req,res)=>{res.setHeader("Content-Type","audio/mpeg");res.setHeader("Accept-Ranges","bytes");res.setHeader("Access-Control-Allow-Origin","*");res.sendFile(path.resolve(__dirname,"public","adhan.mp3"))});
// ==============================================================================
// COMMUNITY & MOSQUE ALERTS API
// ==============================================================================
const COMMUNITY_FILE = path.resolve(__dirname, ".community-data.json");
let localCommunityData = {
  posts: [
    {
      id: "post_welcome_1",
      authorId: "admin_alaoui",
      authorName: "MuslimProBastia",
      authorEmail: "alaouih22@gmail.com",
      authorPhoto: "",
      isAdmin: true,
      content: "As-salamu alaykum wa rahmatullahi wa barakatuh a tutta la comunità di Bastia Umbra e dintorni. Benvenuti nello spazio comunitario ufficiale di MuslimProBastia! Qui condividiamo orari speciali, avvisi delle preghiere del Venerdì (Jumu'ah), lezioni e riflessioni spirituali.",
      category: "announcement",
      likesCount: 14,
      likedBy: ["admin_alaoui"],
      commentsCount: 2,
      comments: [
        {
          id: "comm_1",
          authorId: "user_ahmed",
          authorName: "Ahmed B.",
          content: "Barakallahu feekum per questa meravigliosa applicazione e per il lavoro che fate per la comunità!",
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
        },
        {
          id: "comm_2",
          authorId: "user_karim",
          authorName: "Karim M.",
          content: "Masha Allah, davvero utilissima per seguire le preghiere e gli avvisi della moschea.",
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
        }
      ],
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      id: "post_quran_1",
      authorId: "admin_alaoui",
      authorName: "MuslimProBastia",
      authorEmail: "alaouih22@gmail.com",
      authorPhoto: "",
      isAdmin: true,
      content: "قال رسول الله ﷺ: «خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ» (رواه البخاري)\n\nIl Messaggero di Allah ﷺ ha detto: \"Il migliore tra voi è colui che impara il Corano e lo insegna agli altri\" (Sahih Al-Bukhari). Ricordiamo a tutti che potete leggere e ascoltare il Sacro Corano con lettura Warsh direttamente nella sezione Corano dell'app.",
      category: "quran",
      likesCount: 22,
      likedBy: [],
      commentsCount: 1,
      comments: [
        {
          id: "comm_3",
          authorId: "user_youssef",
          authorName: "Youssef E.",
          content: "Alhamdulillah, la recitazione Warsh è bellissima e chiara.",
          createdAt: new Date(Date.now() - 3600000).toISOString()
        }
      ],
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
    }
  ],
  alerts: [
    {
      id: "alert_jumuah",
      authorId: "admin_alaoui",
      authorName: "MuslimProBastia",
      title: "Preghiera del Venerdì (Jumu'ah) a Bastia",
      body: "Orario ufficiale della preghiera del Venerdì: tutti i venerdì la Khutbah si tiene alle 12:30. Si prega di venire con la wudu fatta e di rispettare le aree di sosta.",
      category: "prayer",
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
    }
  ]
};

function loadLocalCommunity() {
  try {
    if (fs.existsSync(COMMUNITY_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(COMMUNITY_FILE, "utf8"));
      if (parsed && Array.isArray(parsed.posts)) localCommunityData.posts = parsed.posts;
      if (parsed && Array.isArray(parsed.alerts)) localCommunityData.alerts = parsed.alerts;
    }
  } catch {}
}
function saveLocalCommunity() {
  try {
    fs.writeFileSync(COMMUNITY_FILE, JSON.stringify(localCommunityData, null, 2));
  } catch {}
}
loadLocalCommunity();

// Sync from Firestore if available
async function syncFromFirestore() {
  if (!firestoreDb) return;
  try {
    const postsSnap = await getDocs(query(collection(firestoreDb, "communityPosts"), orderBy("createdAt", "desc"), limit(40))).catch(() => null);
    if (postsSnap && !postsSnap.empty) {
      const fsPosts = [];
      postsSnap.forEach(d => {
        fsPosts.push({ id: d.id, ...d.data() });
      });
      if (fsPosts.length > 0) {
        localCommunityData.posts = fsPosts;
        saveLocalCommunity();
      }
    }
    const alertsSnap = await getDocs(query(collection(firestoreDb, "communityAlerts"), orderBy("createdAt", "desc"), limit(10))).catch(() => null);
    if (alertsSnap && !alertsSnap.empty) {
      const fsAlerts = [];
      alertsSnap.forEach(d => {
        fsAlerts.push({ id: d.id, ...d.data() });
      });
      if (fsAlerts.length > 0) {
        localCommunityData.alerts = fsAlerts;
        saveLocalCommunity();
      }
    }
  } catch (e) {
    console.warn("Firestore community sync warning:", e?.message || e);
  }
}
syncFromFirestore().catch(() => {});

// CORS for community endpoints
app.options(["/api/community/posts", "/api/community/posts/:id/like", "/api/community/posts/:id/comment", "/api/community/alerts", "/api/auth/sync-user"], (_req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.sendStatus(204);
});

// GET /api/community/posts
app.get("/api/community/posts", async (_req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-cache");
  return res.json({ ok: true, posts: localCommunityData.posts });
});

// POST /api/community/posts
app.post("/api/community/posts", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const { authorId, authorName, authorPhoto, authorEmail, content, category } = req.body || {};
  if (!content || typeof content !== "string" || !content.trim()) {
    return res.status(400).json({ error: "Content is required" });
  }
  const email = (authorEmail || "").toLowerCase().trim();
  const isAdmin = email === "alaouih22@gmail.com" || email === "hamza.marocchino93@gmail.com";
  const newPost = {
    id: "post_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
    authorId: authorId || "anon_" + Date.now().toString(36),
    authorName: (authorName || (isAdmin ? "MuslimProBastia" : "Fratello/Sorella")).slice(0, 100),
    authorEmail: email,
    authorPhoto: authorPhoto || "",
    isAdmin: isAdmin,
    content: String(content).trim().slice(0, 2500),
    category: category || (isAdmin ? "announcement" : "general"),
    likesCount: 0,
    likedBy: [],
    commentsCount: 0,
    comments: [],
    createdAt: new Date().toISOString()
  };

  localCommunityData.posts.unshift(newPost);
  if (localCommunityData.posts.length > 100) localCommunityData.posts = localCommunityData.posts.slice(0, 100);
  saveLocalCommunity();

  // Save to Firestore
  if (firestoreDb) {
    setDoc(doc(firestoreDb, "communityPosts", newPost.id), newPost).catch(() => {});
  }

  return res.json({ ok: true, post: newPost });
});

// POST /api/community/posts/:id/like
app.post("/api/community/posts/:id/like", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const postId = req.params.id;
  const { userId } = req.body || {};
  const uid = userId || "guest_user";

  const post = localCommunityData.posts.find(p => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  if (!Array.isArray(post.likedBy)) post.likedBy = [];
  const hasLiked = post.likedBy.includes(uid);
  if (hasLiked) {
    post.likedBy = post.likedBy.filter(id => id !== uid);
    post.likesCount = Math.max(0, (post.likesCount || 1) - 1);
  } else {
    post.likedBy.push(uid);
    post.likesCount = (post.likesCount || 0) + 1;
  }
  saveLocalCommunity();

  if (firestoreDb) {
    setDoc(doc(firestoreDb, "communityPosts", postId), {
      likesCount: post.likesCount
    }, { merge: true }).catch(() => {});
  }

  return res.json({ ok: true, hasLiked: !hasLiked, likesCount: post.likesCount });
});

// POST /api/community/posts/:id/comment
app.post("/api/community/posts/:id/comment", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const postId = req.params.id;
  const { authorId, authorName, authorPhoto, content } = req.body || {};
  if (!content || typeof content !== "string" || !content.trim()) {
    return res.status(400).json({ error: "Comment content is required" });
  }

  const post = localCommunityData.posts.find(p => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  if (!Array.isArray(post.comments)) post.comments = [];
  const newComment = {
    id: "comm_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
    authorId: authorId || "anon",
    authorName: (authorName || "Fedele di Bastia").slice(0, 80),
    authorPhoto: authorPhoto || "",
    content: String(content).trim().slice(0, 1000),
    createdAt: new Date().toISOString()
  };

  post.comments.push(newComment);
  post.commentsCount = post.comments.length;
  saveLocalCommunity();

  if (firestoreDb) {
    setDoc(doc(firestoreDb, "communityPosts", postId, "comments", newComment.id), newComment).catch(() => {});
    setDoc(doc(firestoreDb, "communityPosts", postId), { commentsCount: post.commentsCount }, { merge: true }).catch(() => {});
  }

  return res.json({ ok: true, comment: newComment, commentsCount: post.commentsCount });
});

// GET /api/community/alerts
app.get("/api/community/alerts", async (_req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-cache");
  return res.json({ ok: true, alerts: localCommunityData.alerts });
});

// POST /api/community/alerts
app.post("/api/community/alerts", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const { authorId, authorName, authorEmail, title, body, category, sendPush } = req.body || {};
  if (!title || !body) {
    return res.status(400).json({ error: "Title and body are required" });
  }

  const email = (authorEmail || "").toLowerCase().trim();
  const isAdmin = email === "alaouih22@gmail.com" || email === "hamza.marocchino93@gmail.com";
  if (!isAdmin && email) {
    return res.status(403).json({ error: "Unauthorized: only admin can publish community alerts" });
  }

  const newAlert = {
    id: "alert_" + Date.now(),
    authorId: authorId || "admin_alaoui",
    authorName: authorName || "MuslimProBastia",
    authorEmail: email || "alaouih22@gmail.com",
    title: String(title).slice(0, 150),
    body: String(body).slice(0, 1000),
    category: category || "general",
    createdAt: new Date().toISOString()
  };

  localCommunityData.alerts.unshift(newAlert);
  if (localCommunityData.alerts.length > 20) localCommunityData.alerts = localCommunityData.alerts.slice(0, 20);
  saveLocalCommunity();

  if (firestoreDb) {
    setDoc(doc(firestoreDb, "communityAlerts", newAlert.id), newAlert).catch(() => {});
  }

  // If sendPush is requested, broadcast via webpush
  let pushSent = 0;
  if (sendPush) {
    const payload = JSON.stringify({
      title: "📢 " + newAlert.title,
      body: newAlert.body,
      tag: "community-alert-alarm",
      category: newAlert.category,
      url: "/?tab=community"
    });
    for (const [endpoint, subData] of pushSubscriptions.entries()) {
      try {
        await webpush.sendNotification(subData.subscription, payload, { urgency: "high", TTL: 86400 });
        pushSent++;
      } catch (err) {
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          pushSubscriptions.delete(endpoint);
        }
      }
    }
    savePushSubscriptions();
  }

  return res.json({ ok: true, alert: newAlert, pushSent });
});

// DELETE /api/community/alerts/:id
app.delete("/api/community/alerts/:id", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const alertId = req.params.id;
  localCommunityData.alerts = localCommunityData.alerts.filter(a => a.id !== alertId);
  saveLocalCommunity();
  if (firestoreDb) {
    deleteDoc(doc(firestoreDb, "communityAlerts", alertId)).catch(() => {});
  }
  return res.json({ ok: true });
});

// DELETE /api/community/posts/:id
app.delete("/api/community/posts/:id", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const postId = req.params.id;
  localCommunityData.posts = localCommunityData.posts.filter(p => p.id !== postId);
  saveLocalCommunity();
  if (firestoreDb) {
    deleteDoc(doc(firestoreDb, "communityPosts", postId)).catch(() => {});
  }
  return res.json({ ok: true });
});

// POST /api/auth/sync-user
app.post("/api/auth/sync-user", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const { uid, email, displayName, photoURL } = req.body || {};
  if (!uid || !email) {
    return res.status(400).json({ error: "uid and email required" });
  }
  const cleanEmail = String(email).toLowerCase().trim();
  const isAdmin = cleanEmail === "alaouih22@gmail.com" || cleanEmail === "hamza.marocchino93@gmail.com";
  const userProfile = {
    uid,
    email: cleanEmail,
    displayName: displayName || cleanEmail.split("@")[0],
    photoURL: photoURL || "",
    role: isAdmin ? "admin" : "user",
    updatedAt: new Date().toISOString()
  };
  if (firestoreDb) {
    setDoc(doc(firestoreDb, "users", uid), userProfile, { merge: true }).catch(() => {});
  }
  return res.json({ ok: true, profile: userProfile, isAdmin });
});

function renderInlinedHtml() {
  let html = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf8");
  try {
    const css = fs.readFileSync(path.resolve(__dirname, "public", "assets", "index-CypvtVfO.css"), "utf8");
    if (css) {
      html = html.replace(
        /<link rel="stylesheet" href="[^"]*index-CypvtVfO\.css[^"]*"[^>]*>/,
        () => `<style>${css}</style>`
      );
    }
  } catch {}
  try {
    const js = fs.readFileSync(path.resolve(__dirname, "public", "assets", "index-AXg4nBEh.js"), "utf8");
    if (js) {
      html = html.replace(
        /<script>\s*\(function\(\)\s*\{\s*var s = document\.createElement\('script'\);[\s\S]*?<\/script>/,
        () => `<script>${js}</script>`
      );
    }
  } catch {}
  return html;
}

app.get(["/", "/index.html"], (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  return res.send(renderInlinedHtml());
});

const staticHeaders = (res, filePath) => {
  if (filePath.endsWith(".js")) {
    res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  } else if (filePath.endsWith(".css")) {
    res.setHeader("Content-Type", "text/css; charset=utf-8");
  }
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-cache");
};

app.use("/public/assets", express.static(path.resolve(__dirname, "public", "assets"), { setHeaders: staticHeaders }));
app.use("/assets", express.static(path.resolve(__dirname, "public", "assets"), { setHeaders: staticHeaders }));
app.use("/public", express.static(path.resolve(__dirname, "public"), { index: false, setHeaders: staticHeaders }));
app.use(express.static(path.resolve(__dirname, "public"), { index: false }));
app.use(express.static(path.resolve(__dirname, "dist"), { index: false }));

app.get(["/MuslimPro-Warsh.apk", "/public/MuslimPro-Warsh.apk", "/MuslimPro-Warsh-v35.apk", "/MuslimPro-Warsh-v36.apk", "/api/download-apk"], (_req, res) => {
  const apkPath = path.resolve(__dirname, "public", "MuslimPro-Warsh.apk");
  res.setHeader("Content-Type", "application/vnd.android.package-archive");
  res.setHeader("Content-Disposition", 'attachment; filename="MuslimPro-Warsh.apk"');
  res.sendFile(apkPath);
});

app.get("*",(req,res)=>{
  if (req.path.startsWith("/assets/") || req.path.startsWith("/public/assets/")) {
    return res.status(404).type("text/plain").send("Asset not found");
  }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  return res.send(renderInlinedHtml());
});

app.listen(port,"0.0.0.0",()=>{console.log(`Server listening on http://0.0.0.0:${port} (mode: ${isProduction?"prod":"dev"})`);const keepAliveUrls=[process.env.APP_URL?`${process.env.APP_URL.replace(/\/$/,"")}/api/keepalive-pulse`:"","https://ais-dev-mr4e2i4eum4xde3afw2k4u-552873705925.europe-west3.run.app/api/keepalive-pulse"].filter(Boolean);const runKeepAliveLoop=__name(async url=>{while(true){try{await fetch(url,{headers:{"Cache-Control":"no-cache"}})}catch{}await new Promise(r=>setTimeout(r,3e3))}},"runKeepAliveLoop");for(const url of new Set(keepAliveUrls)){runKeepAliveLoop(url).catch(()=>{})}})}__name(bootstrap,"bootstrap");bootstrap().catch(err=>{console.error("Failed to start server:",err);process.exit(1)});




