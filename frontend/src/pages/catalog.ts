import Vue from 'vue'
import App from './Catalog.vue'

Vue.config.productionTip = false;

const app = new Vue({
	render: h => h(App),
}).$mount('#app');
