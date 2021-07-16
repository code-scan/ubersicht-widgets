import { styled, css } from 'uebersicht';

export const refreshFrequency = 1.8e6; // 30m

export const className = `
  left: 360px;
  top: 450px;
  font-family: -apple-system;
  z-index: 1;

  border: 0.125em solid #eee;
  border-radius: 0.25em;
  font-size:17px;
  background-color: rgba(51, 51, 51, 0.5);
  padding: 1em;
`;

const PROXY = 'http://127.0.0.1:41417/';

const api = async query => await fetch(new URL(`${PROXY}https://buaq.net/api.php?act=${query}`));
let lastWeatherUpdate = 0;
export const command = async dispatch => {

  const now = Date.now();
  if (now - lastWeatherUpdate >= 60000) {
    lastWeatherUpdate = Date.now();
    const itemResponse = await api(`list`);
    if (!itemResponse.ok) {
      throw Error(`${itemResponse.status} ${itemResponse.statusText}`);
    }
    const data = await itemResponse.json();
    dispatch({ type: 'FETCH_SUCCEEDED', data });
  }

};

export const updateState = (event, previousState) => {
  switch (event.type) {
    case 'FETCH_SUCCEEDED': return { data: event.data };
    case 'FETCH_FAILED': return { error: event.error.message };
    default: return previousState;
  }
};

const TopStoriesList = styled.ul`
    list-style-type: none;
    line-height: 1.5rem;
    margin: 0;
    padding: 0;
`;

const a = css`
    color: #eee;
    padding: 0 0.5rem;
    text-decoration: none;
`;

const small = css`
    font-size: 0.8rem;
`;

const makeItemLink = id => `https://buaq.net/go-${id}.html`;

var decodeEntities = (function () {
  // this prevents any overhead from creating the object each time
  var element = document.createElement('div');

  function decodeHTMLEntities(str) {
    if (str && typeof str === 'string') {
      // strip script/html tags
      str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
      str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
      element.innerHTML = str;
      str = element.textContent;
      element.textContent = '';
    }

    return str;
  }

  return decodeHTMLEntities;
})();

const StoryLink = ({ id, view, title, url }) => {
  // const link = url ? url : makeItemLink(id);
  const link = makeItemLink(id);

  const host = ` (${(new URL(url)).hostname})`;
  // let  host=""
  title = decodeEntities(title);
  if (view >= 30) {
    return (
      <a className={a} href={link}><font color='yellow'>{`${title}${host}`}</font></a>
    );
  }
  if (view >= 20) {
    return (
      <a className={a} href={link}><font color='#F9E79F'>{`${title}${host}`}</font></a>
    );
  }
  return (
    <a className={a} href={link}>{`${title}${host}`}</a>
  );
};

const DiscussionLink = ({ id, view, title, url, date }) => (
  <span className={small}>
    <a className={a} href={makeItemLink(id)}>[阅读:{view}] - {date}</a>
  </span>
);

const TopStory = ({ id, title, url, view, date }) => (
  <li>
    <StoryLink id={id} view={view} title={title} url={url} />
    <DiscussionLink id={id} view={view} title={title} url={url} date={date} />
  </li>
);

export const render = ({ data = [], error = '' }) => (
  error ? (
    <div>
      {`Error retrieving: ${error}`}
    </div>
  ) : (
    <TopStoriesList>
      {data.map((item) => <TopStory key={item.id} {...item} />)}
    </TopStoriesList>
  )
);
