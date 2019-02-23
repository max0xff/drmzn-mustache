import morphdom from 'morphdom';
import { debounce } from 'lodash';

export const views = (store, container, templates) => {
  
  const parser = new DOMParser();

  const render = () => {
    console.time('render');
    const currentState = store.getState();
    const html = container.render(currentState, templates);
    const prev = document.getElementById('root');
    const next = prev.cloneNode(false);
    const fragment = parser.parseFromString(html, 'text/html').body;
    Object.keys(fragment.childNodes).forEach(() => {
      next.appendChild(fragment.firstElementChild);
    });
    morphdom(prev, next, {
      onBeforeElUpdated: ((fromEl, toEl) => {
        if (fromEl.isEqualNode(toEl) || (fromEl.classList && fromEl.classList.contains('norend'))) {
          return false;
        }
      })
    });
    console.timeEnd('render');
  };

  store.subscribe(debounce(render, 0, {
    leading: false,
    trailing: true
  }));

  return {
    render
  };

};

export default views;
