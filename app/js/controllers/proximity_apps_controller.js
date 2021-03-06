import { Controller } from 'fxos-mvc/dist/mvc';

import AppsService from 'app/js/services/apps_service';
import HttpClientService from 'app/js/services/http_client_service';
import P2pService from 'app/js/services/p2p_service';

import
  ProgressDialogController from 'app/js/controllers/progress_dialog_controller';

import ShareSummaryView from 'app/js/views/share_summary_view';
import HierarchicalListView from 'app/js/views/hierarchical_list_view';

export default class ProximityAppsController extends Controller {
  constructor() {
    this.shareSummaryView = new ShareSummaryView();
    this.shareSummaryView.init(this);
    this.proximityAppsView = new HierarchicalListView({
      id: 'proximity-apps',
      title: 'Available apps',
      type: 'download',
      attr: 'apps'
    });
    this.proximityAppsView.init(this);
    this.proximityAddonsView = new HierarchicalListView({
      id: 'proximity-addons',
      title: 'Available addons',
      type: 'download',
      attr: 'addons'
    });
    this.proximityAddonsView.init(this);
    this.proximityThemesView = new HierarchicalListView({
      id: 'proximity-themes',
      title: 'Available themes',
      type: 'download',
      attr: 'themes'
    });
    this.proximityThemesView.init(this);

    this.progressDialogController = new ProgressDialogController();

    P2pService.instance.addEventListener(
      'proximity', this.proximityChanged.bind(this));

    this._broadcastChangedWrapped = this.broadcastChanged.bind(this);
  }

  main() {
    this.shareSummaryView.render();
    document.body.appendChild(this.shareSummaryView.el);

    this.proximityChanged();
    document.body.appendChild(this.proximityAppsView.el);
    document.body.appendChild(this.proximityAddonsView.el);
    document.body.appendChild(this.proximityThemesView.el);

    P2pService.instance.addEventListener(
      'broadcast', this._broadcastChangedWrapped, true);
  }

  teardown() {
    document.body.removeChild(this.shareSummaryView.el);
    document.body.removeChild(this.proximityAppsView.el);
    document.body.removeChild(this.proximityAddonsView.el);
    document.body.removeChild(this.proximityThemesView.el);

    P2pService.instance.removeEventListener(
      'broadcast', this._broadcastChangedWrapped);
  }

  broadcastChanged() {
    this.shareSummaryView.displayBroadcast(P2pService.instance.broadcast);
  }

  proximityChanged() {
    var proximityApps = P2pService.instance.getProximityApps();
    AppsService.instance.stripInstalledAppsFromProximityApps(
      proximityApps).then((apps) => {
      this.proximityAppsView.render(AppsService.instance.flatten(apps, 'apps'));
    });
    var proximityAddons = P2pService.instance.getProximityAddons();
    AppsService.instance.stripInstalledAppsFromProximityApps(
      proximityAddons).then((addons) => {
      this.proximityAddonsView.render(
        AppsService.instance.flatten(addons, 'addons'));
    });
    var proximityThemes = P2pService.instance.getProximityThemes();
    AppsService.instance.stripInstalledAppsFromProximityApps(
      proximityThemes).then((themes) => {
      this.proximityThemesView.render(
        AppsService.instance.flatten(themes, 'themes'));
    });
  }

  handleControlClick(e) {
    var url = e.target.dataset.url;
    this.progressDialogController.main();
    HttpClientService.instance.downloadApp(url).then(
      this.progressDialogController.success.bind(this.progressDialogController),
      this.progressDialogController.error.bind(this.progressDialogController));
  }

  handleDescriptionClick(e) {
    // In case the tap hit a child node of the <div> element with the data-app
    // attribute set.
    var appName = e.target.dataset.app || e.target.parentNode.dataset.app;
    window.location.hash = 'app';
    window.history.pushState(appName, appName);
  }

  openSharePanel() {
    window.location.hash = 'share';
  }
}
