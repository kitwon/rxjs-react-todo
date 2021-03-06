import React from 'react'
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom'
import Todos from './components/Todos'

import 'todomvc-common/base.css'
import 'todomvc-app-css/index.css'
import './index.css'

const App: React.FC = () => {
  return (
    <div>
      <Router basename="/todos/">
        <div>
          <Route exact path="/" component={Todos} />
          <Route exact path="/:filter" component={Todos} />
          <Route extract path="/*" render={() => <Redirect to="/" />}></Route>
        </div>
      </Router>
    </div>
  )
}

export default App;
