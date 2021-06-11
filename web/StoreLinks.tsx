import * as React from "react";

export default function StoreLinks({
  height,
}: {
  height?: number;
}): JSX.Element {
  return (
    <div className="links">
      <a
        href="https://apps.apple.com/us/app/pixtery/id1569991739"
        target="_blank"
        rel="noreferrer"
      >
        <img
          src="/app-store.svg"
          className={height ? undefined : "logo"}
          alt="Pixtery!"
          style={height ? { height: height / 12 } : undefined}
        />
      </a>
      <a
        href="https://play.google.com/store/apps/details?id=com.fjamstudios.pixtery"
        target="_blank"
        rel="noreferrer"
      >
        <img
          src="/play-store.svg"
          alt="Pixtery!"
          className={height ? undefined : "logo"}
          style={height ? { height: height / 12 } : undefined}
        />
      </a>
    </div>
  );
}
