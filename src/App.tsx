import { Route, Routes } from 'react-router-dom';
import { Home } from './apps/home/Home';
import ParentPage from './apps/parent/ParentPage';
import { NotFound } from './components/NotFound';
import { Shell } from './components/Shell';
import { apps } from './platform/apps';

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Home />} />
        {apps.map((app) => {
          const AppComponent = app.component;
          return <Route key={app.id} path={app.route} element={<AppComponent />} />;
        })}
        <Route path="/ouder" element={<ParentPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
