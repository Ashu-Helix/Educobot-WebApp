import React, { useEffect } from "react";
export default function game({ slug }) {
  useEffect(() => {
    // setTimeout(() => {
    const fileExports = require(`../../../public/game/${slug}/main`);
    Object.keys(fileExports).forEach((key) => {
      window[`${key}`] = fileExports[key];
    })
    // }, 3000);
  }, []);

  return <div id="sprite-container" /*className="animation_window" */ />
  {/* <canvas id="myCustomCanvas" width="1920" height="1080" style={{ width: " 100%", objectFit: "revert", aspectRatio: "738 / 436" }} />
  </div> */}

}
