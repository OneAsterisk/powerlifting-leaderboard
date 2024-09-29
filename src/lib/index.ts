// place files you want to import through the `$lib` alias in this folder.
import './app.html';
import './styles/global.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from '../routes/+layout.svelte';

const app = new App({
	target: document.body
});

export default app;
