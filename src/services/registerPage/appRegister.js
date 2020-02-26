import { setRouteConfig } from './pageRegister';

export default function appRegister(option) {
  if (!option.config || !option.config.route) {
    throw new Error('config.route is necessary !');
  }
  if (option.config) {
    setRouteConfig(option.config.route);
  }
  App(option);
}
