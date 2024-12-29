import { useEffect, useState } from "react";

export default function Home() {
  const [userLocation, setUserLocation] = useState("Traveling");
  const [stationMatch, setStationMatch] = useState(null);
  const [background, setBackground] = useState("/inj.svg");
  const [gapWarning, setGapWarning] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100 over 180s
  const [isAlternating, setIsAlternating] = useState(false); // Track if background should alternate
  const [language, setLanguage] = useState("hi"); // "en" for English, "hi" for Hindi

  // 5 stations, total journey 180s, each station ~36s apart
  const stations = [
    {
      name: "Amravati",
      hindi_name: "अमरावती",
      type: "normal",
      backgrounds: ["/med1.svg", "/med2.svg"],
    },
    {
      name: "Akola",
      hindi_name: "अकोला",
      type: "normal",
      backgrounds: ["/med1.svg", "/med2.svg"],
    },
    {
      name: "Manmad",
      hindi_name: "मनमाड",
      type: "high-risk",
      backgrounds: ["/hi1.svg", "/hi2.svg"],
    },
    {
      name: "Igatpuri",
      hindi_name: "इगतपुरी",
      type: "normal",
      backgrounds: ["/med1.svg", "/med2.svg"],
    },
    {
      name: "Nasik",
      hindi_name: "नासिक",
      type: "normal",
      backgrounds: ["/med1.svg", "/med2.svg"],
    },
  ];

  useEffect(() => {
    let elapsed = 0;
    const total = 180; // seconds
    const interval = setInterval(() => {
      elapsed++;
      if (elapsed > total) {
        clearInterval(interval);
        setUserLocation("Traveling");
        setStationMatch(null);
        setBackground("/inj.svg");
        setGapWarning(false);
        setIsAlternating(false);
        return;
      }

      const pct = Math.floor((elapsed / total) * 100);
      setProgress(pct);

      // Determine the station index based on elapsed time
      const index = Math.min(Math.floor(elapsed / 36), stations.length - 1);
      const station = stations[index];
      const stationArrivalTime = index * 36;
      const stationDepartureTime = stationArrivalTime + 10; // Station stop duration
      const stationNearStartTime = Math.max(stationArrivalTime - 5, 0); // 5 seconds before station
      const stationNearEndTime = Math.min(stationDepartureTime + 5, total); // 5 seconds after station

      if (elapsed >= stationNearStartTime && elapsed <= stationNearEndTime) {
        // Train near or at the station
        setStationMatch(station.name);
        setUserLocation(station.name);
        setGapWarning(station.type === "high-risk");
        setIsAlternating(true); // Enable alternating backgrounds
      } else {
        // Train traveling
        setStationMatch(null);
        setUserLocation("Traveling");
        setBackground("/inj.svg");
        setGapWarning(false);
        setIsAlternating(false); // Disable alternating backgrounds
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isAlternating) return;

    let toggle = false;
    const bgToggleInterval = setInterval(() => {
      const station = stations.find((st) => st.name === stationMatch);
      if (station) {
        setBackground(toggle ? station.backgrounds[0] : station.backgrounds[1]);
      }
      toggle = !toggle;
    }, 700);

    return () => clearInterval(bgToggleInterval);
  }, [isAlternating, stationMatch]); // Only run when alternating is active and station changes

  const toggleLanguage = () => {
    setLanguage((prevLang) => (prevLang === "en" ? "hi" : "en"));
  };

  const translations = {
    en: {
      traveling: "Traveling",
      assistText:
        "Hello, I am here to assist you with safely boarding and deboarding",
      station: "Station",
      mindGap: " beware",
    },
    hi: {
      traveling: "यात्रा में",
      assistText:
        "नमस्ते, मैं आपको सुरक्षित चढ़ने और उतरने में मदद करने के लिए यहां हूं",
      station: "स्टेशन",
      mindGap: " से सावधान रहें",
    },
  };

  return (
    <>
      <style jsx>
        {`
          .fade-image {
            transition: opacity 0.5s ease-in-out;
          }
        `}
      </style>
      <div className="relative h-screen w-screen">
        <button
          onClick={toggleLanguage}
          className="absolute top-4 right-2 px-2 py-1 bg-black font-bold text-white rounded z-10 bg-opacity-20 backdrop-blur-sm"
        >
          {/* {language === "" ? "ह" : "En"} */}
          {language === "en" ? "हिं" : "En"}
        </button>
        <div
          className="absolute inset-0 h-full w-full fade-image"
          style={{
            backgroundImage: `url(${background})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Top text overlay */}
        <div className="absolute inset-0 h-2/3 flex flex-col justify-start items-start  text-black">
          <h1 className="text-4xl mt-12 w-full px-4 text-left font-semibold">
            {stationMatch
              ? `${
                  language === "en"
                    ? stationMatch
                    : stations.find((st) => st.name === stationMatch)
                        ?.hindi_name
                } ${translations[language].station}`
              : translations[language].assistText}
          </h1>

          {stationMatch && (
            <p className="text-2xl m-4 font-bold text-yellow-600 text-left">
              <span
                className={`${
                  gapWarning
                    ? "text-6xl font-black text-red-600"
                    : "text-2xl text-orange-600"
                }`}
              >
                {/* show GAP or hindi version of GAP here based on whats selected */}
                {language === "en" ? "GAP" : "गैप"}
              </span>
              {translations[language].mindGap}
            </p>
          )}
        </div>
        {/* Timeline at the bottom */}
        <div className="absolute bottom-0 w-full p-4">
          <div className="relative h-2 bg-gray-300 rounded">
            {/* Progress line */}
            <div
              className="absolute h-1 bg-gray-800 rounded"
              style={{ width: `${progress}%` }}
            />
            {/* Moving circle */}
            <div
              className="absolute w-4 h-1 bg-gray-500 rounded-full -top-1"
              style={{ left: `calc(${progress}% - 8px)` }}
            />
            {/* Station markers */}
            {stations.map((st, i) => {
              const leftPos = (i / (stations.length - 1)) * 100;
              return (
                <div
                  key={st.name}
                  className="absolute -top-5 text-xs text-black text-center font-semibold px-2"
                  style={{ left: `calc(${leftPos}% - 10px)` }}
                >
                  <div className="absolute top-5 w-2 h-2 bg-black rounded-full mx-auto mb-6" />
                  {i === 0 || i === stations.length - 1 || progress >= leftPos
                    ? // based on language selected show hindi or english name
                      language === "en"
                      ? st.name
                      : st.hindi_name
                    : ""}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
