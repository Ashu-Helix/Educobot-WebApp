import React, { useEffect, useState } from "react";
import type {
  GetServerSideProps,
  GetStaticPaths,
  GetStaticProps,
  NextPage,
} from "next";
import Image from "next/image";
import dynamic from "next/dynamic";
import styles from "../../../styles/Problems.module.css";
import Game from "./game";
import { useRouter } from "next/router";
import { existsSync, mkdirSync, readdir, readdirSync, writeFileSync } from "fs";
import path from "path";
import * as XLSX from "xlsx";
import TestDialog from "../../../MyComponents/DialogBoxes/TutorialDialog";
const Blocky = dynamic(import("../../../components/Blocky"), { ssr: false });
import axios from 'axios';

const Tour = dynamic(import("../../../components/Tour"), { ssr: false, });

export const getStaticPaths = async () => {

  const res = await fetch(
    `https://api.educobot.com/lessonsRoute/getAllLessonID`, { method: 'POST' }
  );
  const data = await res.json();
  const paths = data.data.map((t) => ({ params: { slug: t.lsID } }));


  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {

  const readedData = XLSX.readFile("public/BunnyLanguageTemplate.xlsx", {
    type: "binary",
  });

  const sheetNames = readedData.SheetNames;
  let index = 2;
  sheetNames.forEach((s, i) => {
    context.params.slug === s.toLowerCase() ? index = i : 0
  })

  const wsname = readedData.SheetNames[index];
  const ws = readedData.Sheets[wsname];

  /* Convert array to json*/
  const dataParse: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });
  // getting all files from the server

  const blockPath = path.join(process.cwd(), "public", "block");
  const blockFileName = path.join(blockPath, `${context.params.slug}_Blocks.js`); //_Blocks

  const mcqPath = path.join(process.cwd(), "public", "mcq");
  const mcqFileName = path.join(mcqPath, `${context.params.slug}Mcq.js`); //Mcq

  const gameFolderPath = path.join(process.cwd(), "public", "game");
  const gameSubFolder = path.join(gameFolderPath, `${context.params.slug}`);

  const configFile = path.join(gameSubFolder, `config.js`);
  const constantFile = path.join(gameSubFolder, `constant.js`);
  const mainFile = path.join(gameSubFolder, `main.js`);

  const anim1 = await fetch(
    `${process.env.SERVER_URL}/liveLessons/${context.params.slug}/config.js`
  );
  const anim2 = await fetch(
    `${process.env.SERVER_URL}/liveLessons/${context.params.slug}/constant.js`
  );
  const anim3 = await fetch(
    `${process.env.SERVER_URL}/liveLessons/${context.params.slug}/main.js`
  );
  const block_file = await fetch(
    `${process.env.SERVER_URL}/liveLessons/${context.params.slug}/Blocks.js`
  );
  const mcq_file = await fetch(
    `${process.env.SERVER_URL}/liveLessons/${context.params.slug}/Mcq.js`
  );

  if (
    anim1.status === 404 ||
    anim2.status === 404 ||
    anim3.status === 404 ||
    block_file.status === 404
  ) {
    return {
      notFound: true,
    };
  }

  const anim1_text = await anim1.text();
  const anim2_text = await anim2.text();
  const anim3_text = await anim3.text();
  const block = await block_file.text(); //block
  const mcq = await mcq_file.text(); //mcq


  if (!existsSync(blockFileName)) {
    writeFileSync(blockFileName, block);
  }

  if (!existsSync(mcqFileName)) {
    writeFileSync(mcqFileName, mcq);
  }

  if (existsSync(gameFolderPath)) {
    if (!existsSync(gameSubFolder)) {
      mkdirSync(gameSubFolder);
    }
    if (!existsSync(configFile)) {
      writeFileSync(configFile, anim1_text);
    }
    if (!existsSync(constantFile)) {
      writeFileSync(constantFile, anim2_text);
    }
    if (!existsSync(mainFile)) {
      writeFileSync(mainFile, anim3_text);
    }
  }

  return {
    props: { dataParse, slug: context.params.slug },
  };
};
const language = { English: 1, Hindi: 2, Marathi: 3, Spanish: 4, Arabic: 5, Swaheli: 6 }

export default function PhaserGame(props) {
  const [timer, setTimer] = useState(0);
  const [imt, setImt] = useState([]);
  const router = useRouter();
  const { dataParse, slug } = props;
  const [muteState, setMute] = useState(false);
  const [reset, setReset] = useState(false);
  const [lang, setLang] = useState(1);
  const [javascriptCode, setJavascriptCode] = useState("");
  const [PythonCode, setPythonCode] = useState("");
  const [xml, setXml] = useState("");
  const tut: any[] = dataParse.map(data => (data[lang]))
  tut.shift();
  let McqData = require(`../../../public/mcq/${slug}Mcq.js`);

  let headers = new Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Accept', 'application/json');
  headers.append('Access-Control-Allow-Origin', '*');
  headers.append('Access-Control-Allow-Credentials', 'true');
  headers.append('GET', 'POST');

  const handleClick = async () => {
    try {
      if (window[`runCode`]) {
        window[`runCode`]();
      }
      //else {
      //   window[`reset_output`]();
      //   eval(`(async function(){ ${javascriptCode} })();`);
      // }
    } catch (e) {
      alert(e);
    }
  };
  const reSet = () => {
    try {
      window[`reset_output`]();
    } catch (err) { console.log(err) }
  };

  function onChange(e) {
    setLang(parseInt(e.target.value))
    const tut: any[] = dataParse.map(data => (data[e.target.value]))
    tut.shift();
    window['tutorials'] = tut
    console.log(window['tutorials'])
    window['loadAgain']()
  }

  function FinalTask(value) {

    const user_id = router.query.user_id;
    let blocks = 0
    if (typeof window !== "undefined" && window['getNoOfBlocks'])
      blocks = window['getNoOfBlocks']();

    console.log(blocks, value, user_id, timer)
    fetch(`https://api.educobot.com/users/postEvalData`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        timeTaken: timer,
        userID: user_id,//"d45c7cb9-831e-4a2c-9372-0b1f34a0fae6",
        lessonID: slug, blocks,
        coins: value
      })
    }).then(res => res.json())
      .then(res => console.log(res))

  }

  useEffect(() => {
    // McqData = require(`../../../public/mcq/${slug}Mcq.js`);

    if (typeof window !== "undefined" && window['updateImports'])
      setImt([...window['updateImports']])
    window['tutorials'] = tut
    const interval = setInterval(() => {
      setTimer(t => t + 1);
      let completed = window[`completedFlag`];
      if (completed()) {
        document.getElementById("openTest").click();
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [router.query]);

  return (
    <>
      <div
        style={{
          height: "100%",
          display: "flex"
        }}
      >
        <div className="fill-blockly" id="blocklyDiv">
          <Blocky
            setBlocks={xml}
            slug={slug}
            setJavaScript={setJavascriptCode}
            setPythonCode={setPythonCode}
          />
        </div>

        <div className={styles.canvas} style={{ padding: "0 1rem" }}>
          <div className={""}>
            <button
              className={`${styles.normal_button} `}
              data-position="bottom"
              data-tooltip="Run Code"
              id="runbtn"
              onClick={handleClick}
            >
              <Image
                src="/assets/run_button_icon_landscape.png"
                width="30"
                height="30"
              />
            </button>
            <button
              className={`${styles.normal_button} `}
              data-position="bottom"
              data-tooltip="Reset Output"
              onClick={reSet}
            >
              <img src="/assets/reset_button_icon.png" width="30" height="30" />
            </button>
            <button
              className={`${styles.normal_button}  ${styles.sound}`}
              data-position="bottom"
              data-tooltip="Open Keyboard"
              id="soundBtn"
              onClick={() => setMute(!muteState)}
            >
              <img
                src={muteState ? "/assets/mute.png" : "/assets/unmute.png"}
                width="30"
                height="30"
              />
            </button>
            <button
              className={`${styles.normal_button}`}
              data-position="bottom"
              data-tooltip="Help"
              onClick={() => setXml(window["helpCode"])}
            >
              <img src="/assets/help_button_icon.png" width="30" height="30" />
            </button>
            <select className={`${styles.select_language}`} value={lang} onChange={onChange}>
              {
                Object.keys(language).map(key => <option key={key} value={`${language[key]}`}>{key}</option>)
              }
            </select>

          </div>
          <Game slug={slug} />
          <div
            id="pycode"
            className={styles.output}
            style={{ minHeight: "9vh" }}
          >
            {imt.map(res => {
              return (<><b style={{ color: "#fff", display: "contents" }}>
                import {res}
              </b>
                <br /></>)
            })}

            {PythonCode}
          </div>
          <TestDialog
            getCoins={FinalTask}
            slug={slug}
            testDialogInfo={{
              dialogStatus: "test",
            }}
          />
        </div>
      </div>
      <Tour slug={slug} />
      <label id="hand" htmlFor="test">
        <img src="/assets/hand_upward.png" width="50px" height="60px" />
      </label>
      {/*      <ShepherdTour tut={tut} /> */}
    </>
  );
}
