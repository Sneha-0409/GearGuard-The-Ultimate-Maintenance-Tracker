import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface Edge {
  answer: string;
  nextNodeId: string;
}

interface DiagnosticNode {
  _id: string;
  isRoot: boolean;
  question?: string;
  rootCause?: string;
  edges: Edge[];
}

interface RCAWizardModalProps {
  category: string;
  onClose: () => void;
  onComplete: (rootCause: string, nodeId: string) => void;
}

export default function RCAWizardModal({ category, onClose, onComplete }: RCAWizardModalProps) {
  const [nodes, setNodes] = useState<DiagnosticNode[]>([]);
  const [currentNode, setCurrentNode] = useState<DiagnosticNode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/v1/diagnostics/${category}`)
      .then(res => {
        const data = res.data.data;
        setNodes(data);
        const root = data.find((n: DiagnosticNode) => n.isRoot);
        if (root) {
          setCurrentNode(root);
        } else {
          toast.error('No RCA Tree found for this category.');
          onClose();
        }
      })
      .catch(err => {
        console.error(err);
        toast.error('Failed to load RCA Tree.');
        onClose();
      })
      .finally(() => setLoading(false));
  }, [category, onClose]);

  const handleEdgeClick = (nextNodeId: string) => {
    const nextNode = nodes.find(n => n._id === nextNodeId);
    if (nextNode) {
      setCurrentNode(nextNode);
    } else {
      toast.error('Error: Linked node not found.');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading Diagnostic Tree...</p>
        </div>
      </div>
    );
  }

  if (!currentNode) return null;

  const isLeaf = !currentNode.question && !!currentNode.rootCause;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
            Root Cause Analysis Wizard
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1">
          {!isLeaf ? (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-medium uppercase tracking-wider">Question</p>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white leading-tight">
                  {currentNode.question}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 gap-3 pt-4">
                {currentNode.edges.map((edge, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleEdgeClick(edge.nextNodeId)}
                    className="flex items-center justify-between p-4 rounded-xl border-2 border-blue-100 dark:border-blue-900/30 bg-white dark:bg-gray-800 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-200 transition-all group"
                  >
                    <span className="font-medium text-lg">{edge.answer}</span>
                    <ArrowRight className="w-5 h-5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6 py-4">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-medium uppercase tracking-wider">Determined Root Cause</p>
                <h3 className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {currentNode.rootCause}
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Please confirm this root cause to attach it to the maintenance ticket.
              </p>
              
              <div className="pt-6">
                <button
                  onClick={() => onComplete(currentNode.rootCause!, currentNode._id)}
                  className="w-full flex items-center justify-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-red-500/30"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Confirm & Attach Root Cause
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
