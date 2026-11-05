import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useProgressStore } from './store/progressStore';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Roadmap from './pages/Roadmap';
import KnowledgeGraph from './pages/KnowledgeGraph';
import SubjectExplorer from './pages/SubjectExplorer';
import TopicDetail from './pages/TopicDetail';
import ProgressSettings from './pages/ProgressSettings';
import NotFound from './pages/NotFound';

export default function App() {
  const loadProgress = useProgressStore((s) => s.loadProgress);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  return (
    <BrowserRouter basename="/CS-Master-Roadmap_Oct26">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="roadmap" element={<Roadmap />} />
          <Route path="graph" element={<KnowledgeGraph />} />
          <Route path="subject/:subjectId" element={<SubjectExplorer />} />
          <Route path="topic/:topicId" element={<TopicDetail />} />
          <Route path="progress" element={<ProgressSettings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
