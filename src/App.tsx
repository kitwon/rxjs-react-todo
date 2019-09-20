import React from 'react';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom'
import Todos from './components/Todos'

import 'todomvc-common/base.css';
import 'todomvc-app-css/index.css';

const App: React.FC = () => {
  return (
    <div>
      <Router>
        <Route extract path="/" render={() => <Redirect to="/todos/" />}></Route>
      </Router>

      <Router basename="/todos/">
        <div>
          <Route exact path="/" component={Todos} />
          <Route exact path="/:filter" component={Todos} />
        </div>
      </Router>
    </div>
  )
}

export default App;
