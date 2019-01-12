import Vue from 'vue'
import App from './Subgenre.vue'

Vue.config.productionTip = false;

const app = new Vue({
	render: h => h(App),
}).$mount('#app');
