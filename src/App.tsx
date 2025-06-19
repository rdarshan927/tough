import { Provider } from 'react-redux';
import Chat from './Chat';
import store from './Store';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <Chat />
    </Provider>
  );
}

export default App;