import { css, run } from "uebersicht";
import * as config from "./config.json";

// console.log(config);

const options = {
  top: "1060px",
  left: "0px",
  width: "1920px",
  // Refer to https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
  timezone: "Asia/Shanghai",
  city: "Nanjing",
};

let lastWeatherUpdate = 0;
let temp = 0;
let weather = "";
let curretnSpace = 0 ;
let windowsList={};
export const command = dispatch => {
  const now = Date.now();

  if (now - lastWeatherUpdate >= 600) {
    lastWeatherUpdate = Date.now();
     run(`/usr/local/bin/yabai -m query --spaces --space`).then(current =>{
      console.log(current);
      current=JSON.parse(current);
      curretnSpace=current.index;
    })
    run(`/usr/local/bin/yabai -m query --displays`).then(response => {
      //console.log(response);
      if(response.length<10) return;
      return dispatch({
        type: "DATE_UPDATE",
        data: response,
        
      });
    });
	run(`/usr/local/bin/yabai -m query --windows`).then(space =>{
		if(space.length<10) return;
		windowsList={}
		space=JSON.parse(space);
		for (var key in space) {
			if (space.hasOwnProperty(key)) {
				var element = space[key];
				if(windowsList.hasOwnProperty(element.space)){
					windowsList[element.space].push(element.app)
					// windowsList[element.space].push(element.title)
				}else{
					windowsList[element.space]=[element.app]
					// windowsList[element.space]=[element.title]
				}
			}
		}
		console.log(windowsList)
	})
  }
  
  if (now - lastWeatherUpdate >= 600) {
    lastWeatherUpdate = Date.now();
    run(`/usr/local/bin/yabai -m query --spaces --space`).then(response => {
      //console.log(response);
      if(response.length<10) return;
      return dispatch({
        type: "SPACE_UPDATE",
        data: response,
      });
    });
  }

  // const now = Date.now();

  // Update every hour
  // if (now - lastWeatherUpdate >= 60000) {
  //   lastWeatherUpdate = Date.now();

  //   fetch(
  //     `https://api.openweathermap.org/data/2.5/weather?q=${options.city}&units=metric&appid=${config.OPENWEATHERMAP_APIKEY}`
  //   ).then(response => {
  //     return dispatch({
  //       type: "WEATHER_UPDATE",
  //       data: {
  //         weather: response.json(),
  //       },
  //     });
  //   });
  // }
};

export const refreshFrequency = 1000;

export const className = {
  top: options.top,
  left: options.left,
  width: options.width,
  userSelect: "none",

  backgroundColor: "rgba(0, 0, 0, 0.8)",
  // border: "1px solid #333",
  padding: "5px",
  boxSizing: "border-box",
  borderRadius: "0px", // 圆角
};

const containerClassName = css({
  color: "rgba(255, 255, 255)",
  fontFamily: "PT Mono",
  fontSize: "11px",
  textAlign: "left",
});

const red = css({
  color: "#EF233C",
});

const green = css({
  color: "#3BCA2B",
});

const blue = css({
  color: "#5DADE2",
});

const yellow = css({
  color: "#ffff00",
});

const orange = css({
  color: "#FF8C00",
});
function GetSpace(space){
  var result="";
  for(var i=0;i<space.length;i++){
    let id = space[i];
	let windows=""
	if(windowsList.hasOwnProperty(id)){
		windows=windowsList[id]
	}
    if(id==curretnSpace){
      id=`*${id}`
    }
    result=result+`[${id} - ${windows}] `
  }
  return result;
}
export const updateState = (event, previousState) => {
  if (event.error) {
    return { ...previousState, warning: `We got an error: ${event.error}` };
  }
  if(event.type=="SPACE_UPDATE"){
    const result = JSON.parse(event.data);
    curretnSpace=result.index;
    return;
  }
  if (event.type === "DATE_UPDATE") {
    // const [day, month, dayNum, year, time] = event.data.split(" ");
    const result = JSON.parse(event.data);
    // console.log(result[0].spaces);
    
    return {
      warning: false,
      day: `${GetSpace(result[2].spaces)}`,
      month: `${GetSpace(result[0].spaces)}`,
      dayNum: `${GetSpace(result[3].spaces)}`,
      year: `${GetSpace(result[1].spaces)}`,
      time: 4,
    };
    // return {
    //   warning: false,
    //   day: `[#${result[2].index}-${result[2].spaces}]`,
    //   month: `[#${result[0].index}-${result[0].spaces}]`,
    //   dayNum:  `[#${result[3].index}-${result[3].spaces}]`,
    //   year: `[#${result[1].index}-${result[1].spaces}]`,
    //   time: 4,
    // };
  } else if (event.type === "WEATHER_UPDATE") {
    event.data.weather.then(data => {
      temp = data.main.temp;
      weather = data.weather[0].main;
    });
  }

  return {
    ...previousState,
    warning: false,
  };
};

export const render = ({ warning, day, month, dayNum, year, time }) => {
  if (warning) {
    return <div>{warning}</div>;
  }

  return (
    <div className={containerClassName}>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css"
        integrity="sha512-+4zCK9k+qNFUR5X+cKL9EIR+ZOhtIloNl9GIKS57V1MyNsYpYcUrUeQc9vNfzsWfV28IaLL3i96P9sdNyeRssA=="
        crossOrigin="anonymous"
      />
      {/* {month} {day}  */}
      <i className={`far fa-heart ${yellow}`}></i> {day}{" "}
      <i className={`far fa-code ${green}`}></i> {month}{" "}
      <i className={`fas fa-play ${red}`}></i> {dayNum}{" "}
      <i className={`fa fa-star ${blue}`}></i> {year}
    </div>
  );
};
