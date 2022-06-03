import type { NextPage } from 'next'
import Image from 'next/image'
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import Canvas from '../components/Canvas';
import styles from '../styles/Problems.module.css'
const Blocky = dynamic(import('../components/Blocky'), { ssr: false })
//const Tour = dynamic(import('../components/tour'), { ssr: false })
const ShepherdTour = dynamic(import('../components/shepherdTour'), { ssr: false })
import { GetStaticProps } from "next/types";
import * as XLSX from 'xlsx';

const language = { English: 1, Hindi: 2, Marathi: 3, Spanish: 4, Arabic: 5, Swaheli: 6 }

export const getStaticProps: GetStaticProps = async (context) => {
    const readedData = XLSX.readFile('public/BunnyLanguageTemplate.xlsx', { type: 'binary' })

    const wsname = readedData.SheetNames[0];
    const ws = readedData.Sheets[wsname];

    /* Convert array to json*/
    const dataParse: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });
    const res = await fetch(`${process.env.PATH_URL}/files/fetchbunny.js`)
    const file = await res.text()

    return { props: { dataParse, file, url: "bunny_Blocks" } }

}
const Home: NextPage<any> = (props) => {
    const tut: any[] = props.dataParse.map(data => (data[language.English]))
    tut.shift()

    const [muteState, setMute] = useState(false);
    const [command, setcommand] = useState('')
    const [reset, setReset] = useState(false)
    const [javascriptCode, setJavascriptCode] = useState('');
    const [PythonCode, setPythonCode] = useState('');
    const [file] = useState(props.file)
    let startAnimating: () => void;
    const bunny1: Function = new Function("return " + file)()

    useEffect(() => {
        // const blo = fetch('http://localhost:3000/blocks/trafficBlocks.js')
        //     .then(res => res.text())
        //     .then(res => console.log(res))

    }, [])

    const handleClick = async () => {

        const bunny = bunny1()
        //const bunny = require("../public/files/bunny1")
        startAnimating = bunny?.reset_output
        startAnimating()

        try {
            eval(PythonCode);
        } catch (e) { alert(e); }
    }
    return (
        <>
            <div style={{ display: "grid", height: "100%", gridTemplateColumns: "repeat(2, 1fr)" }}>
                <Blocky
                    url={props.url}
                    setJavaScript={setJavascriptCode}
                    setPythonCode={setPythonCode}
                />
                < div id="circle" className={styles.canvas} style={{ padding: '0 1rem' }}>
                    <div className={''}>
                        <button className={`${styles.normal_button} `}
                            data-position="bottom" data-tooltip="Run Code"
                            id='runbtn'
                            onClick={handleClick}
                        >
                            <Image src="/assets/run_button_icon_landscape.png"
                                width="30" height="30"
                            />
                        </button>
                        <button className={`${styles.normal_button} `}
                            data-position="bottom" data-tooltip="Reset Output"
                            onClick={() => setReset(!reset)}
                        >
                            <img src="/assets/reset_button_icon.png"
                                width="30" height="30"
                            />
                        </button>
                        <button className={`${styles.normal_button}  ${styles.sound}`}
                            data-position="bottom" data-tooltip="Open Keyboard"
                            id="soundBtn"
                            onClick={() => setMute(!muteState)}
                        >
                            <img src={muteState ? "/assets/mute.png" : "/assets/unmute.png"}
                                width="30" height="30"
                            />
                        </button>
                    </div>

                    {<Canvas
                        command={command}
                        id="sprite"
                        className={''}
                        handleReset={setReset}
                        reset={reset}
                        setCommand={setcommand}
                        slug={"farm"}
                    />}
                    <div id="pycode" className={styles.output} style={{ minHeight: '9vh' }}>
                        <b style={{ color: "#fff", display: "contents" }}>import bunny </b> <br />
                        {PythonCode}
                    </div>
                </div>
            </div>
            <label id="hand" htmlFor="test">
                <img src="/assets/hand_upward.png" width="50px" height="60px" />
            </label>
            <ShepherdTour tut={tut} />
        </>
    )
}
export default Home
