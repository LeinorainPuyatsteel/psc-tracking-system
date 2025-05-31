import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import "./assets/style.css";

import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faClipboardList,
  faDolly,
  faBoxOpen,
  faTruckLoading,
  faClock,
  faWeight,
  faCheckCircle,
  faTruckFast,
  faTruckFront,
  faClipboardCheck,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";

library.add(
  faClipboardList,
  faDolly,
  faBoxOpen,
  faTruckLoading,
  faClock,
  faWeight,
  faCheckCircle,
  faTruckFast,
  faTruckFront,
  faClipboardCheck,
  faArrowLeft
);

const app = createApp(App);

app.component("font-awesome-icon", FontAwesomeIcon);

app.use(createPinia());
app.use(router);

app.mount("#app");
