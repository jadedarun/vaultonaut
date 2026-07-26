import { motion } from 'framer-motion';
import { AIWorkspaceProvider } from '../../context/AIWorkspaceContext';
import AIWorkspace from '../ai/AIWorkspace';

export default function AIWorkspaceSection() {
  return (
    <AIWorkspaceProvider>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25 }}
        style={{ width: '100%', height: '100%' }}
      >
        <AIWorkspace />
      </motion.div>
    </AIWorkspaceProvider>
  );
}
