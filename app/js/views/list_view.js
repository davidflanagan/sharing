import { View } from 'components/fxos-mvc/dist/mvc';

import 'components/gaia-list/gaia-list';
import 'components/gaia-button/gaia-button';

export default class ListView extends View {
  constructor(id, title, type) {
    this.el = document.createElement('gaia-list');
    this.title = title;
    this.el.id = id;
    this.type = type;
  }

  layout(template) {
    return `<h1>${this.title}</h1>${template}`;
  }

  template(app) {
    var string = `
      <li tabindex="0">
        <div>
          <h3>${app.manifest.name}</h3>
          <h4>${app.owner}</h4>
        </div>
        ${this._control(app)}
      </li>`;
    return string;
  }

  render(params) {
    super(params);

    setTimeout(() => {
      this._controls = this.$$('.control');
      for (var i = 0; i < this._controls.length; i++) {
        var control = this._controls[i];
        control.addEventListener('click', this._handleClick.bind(this));
      }
    });
  }

  _control(app) {
    if (this.type === 'toggle') {
      return `<input class="control" type="checkbox"></input>`;
    } else if (this.type === 'download') {
      var string = `
      <gaia-button data-app="${app.manifest.name}" class="control">
        Download
      </gaia-button>`;
      return string;
    }
  }

  _handleClick(e) {
    this.controller.handleClick(e);
  }
}