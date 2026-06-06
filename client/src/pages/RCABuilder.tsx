import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Share2, CornerDownRight } from 'lucide-react';
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

export default function RCABuilder() {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [nodes, setNodes] = useState<DiagnosticNode[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch unique categories
    axios.get('/api/v1/equipment')
      .then(res => {
        const cats = Array.from(new Set(res.data.data.map((e: any) => e.category))) as string[];
        setCategories(cats);
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      setLoading(true);
      axios.get(`/api/v1/diagnostics/${selectedCategory}`)
        .then(res => {
          if (res.data.data.length === 0) {
            setNodes([{
              _id: `new_${Date.now()}`,
              isRoot: true,
              question: 'Describe the main issue...',
              edges: []
            }]);
          } else {
            setNodes(res.data.data);
          }
        })
        .catch(err => toast.error('Failed to load RCA tree'))
        .finally(() => setLoading(false));
    }
  }, [selectedCategory]);

  const saveTree = async () => {
    try {
      await axios.post(`/api/v1/diagnostics/${selectedCategory}`, { nodes });
      toast.success('RCA Tree saved successfully');
    } catch (error) {
      toast.error('Failed to save RCA Tree');
    }
  };

  const addNode = () => {
    setNodes([...nodes, {
      _id: `new_${Date.now()}`,
      isRoot: false,
      question: '',
      edges: []
    }]);
  };

  const removeNode = (id: string) => {
    setNodes(nodes.filter(n => n._id !== id).map(n => ({
      ...n,
      edges: n.edges.filter(e => e.nextNodeId !== id)
    })));
  };

  const updateNode = (id: string, updates: Partial<DiagnosticNode>) => {
    setNodes(nodes.map(n => n._id === id ? { ...n, ...updates } : n));
  };

  const addEdge = (nodeId: string) => {
    setNodes(nodes.map(n => {
      if (n._id === nodeId) {
        return {
          ...n,
          edges: [...n.edges, { answer: '', nextNodeId: '' }]
        };
      }
      return n;
    }));
  };

  const updateEdge = (nodeId: string, edgeIndex: number, updates: Partial<Edge>) => {
    setNodes(nodes.map(n => {
      if (n._id === nodeId) {
        const newEdges = [...n.edges];
        newEdges[edgeIndex] = { ...newEdges[edgeIndex], ...updates };
        return { ...n, edges: newEdges };
      }
      return n;
    }));
  };

  const removeEdge = (nodeId: string, edgeIndex: number) => {
    setNodes(nodes.map(n => {
      if (n._id === nodeId) {
        const newEdges = [...n.edges];
        newEdges.splice(edgeIndex, 1);
        return { ...n, edges: newEdges };
      }
      return n;
    }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">RCA Tree Builder</h1>
          <p className="text-gray-500">Construct diagnostic logic trees for equipment categories.</p>
        </div>
        <button
          onClick={saveTree}
          disabled={!selectedCategory || loading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-5 h-5 mr-2" />
          Save Tree
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Equipment Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full md:w-1/3 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        >
          <option value="">-- Select Category --</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {selectedCategory && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Nodes ({nodes.length})</h2>
            <button
              onClick={addNode}
              className="flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Node
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nodes.map(node => {
              const isLeaf = !node.question && !!node.rootCause;
              return (
                <div key={node._id} className={`bg-white dark:bg-gray-900 rounded-lg shadow border-2 ${node.isRoot ? 'border-green-500' : isLeaf ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} p-4`}>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${node.isRoot ? 'bg-green-100 text-green-800' : isLeaf ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                      {node.isRoot ? 'Root Node' : isLeaf ? 'Leaf Node (Root Cause)' : 'Branch Node'}
                    </span>
                    {!node.isRoot && (
                      <button onClick={() => removeNode(node._id)} className="text-gray-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                      <select
                        value={isLeaf ? 'leaf' : 'branch'}
                        onChange={(e) => {
                          if (e.target.value === 'leaf') {
                            updateNode(node._id, { question: '', rootCause: 'Determined Cause', edges: [] });
                          } else {
                            updateNode(node._id, { question: 'New Question', rootCause: '' });
                          }
                        }}
                        className="w-full text-sm border-gray-300 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        disabled={node.isRoot}
                      >
                        <option value="branch">Branch (Question)</option>
                        <option value="leaf">Leaf (Root Cause)</option>
                      </select>
                    </div>

                    {!isLeaf ? (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Question</label>
                        <input
                          type="text"
                          value={node.question || ''}
                          onChange={(e) => updateNode(node._id, { question: e.target.value })}
                          placeholder="e.g. Is the motor hot?"
                          className="w-full text-sm border-gray-300 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Root Cause Determination</label>
                        <input
                          type="text"
                          value={node.rootCause || ''}
                          onChange={(e) => updateNode(node._id, { rootCause: e.target.value })}
                          placeholder="e.g. Blown Fuse"
                          className="w-full text-sm border-gray-300 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                      </div>
                    )}

                    {!isLeaf && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-xs font-medium text-gray-500">Answers / Edges</label>
                          <button onClick={() => addEdge(node._id)} className="text-xs text-blue-600 hover:text-blue-800 flex items-center">
                            <Plus className="w-3 h-3 mr-1" /> Add
                          </button>
                        </div>
                        {node.edges.map((edge, idx) => (
                          <div key={idx} className="flex flex-col space-y-1 mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                placeholder="Answer (e.g. Yes)"
                                value={edge.answer}
                                onChange={(e) => updateEdge(node._id, idx, { answer: e.target.value })}
                                className="w-1/2 text-xs border-gray-300 rounded"
                              />
                              <select
                                value={edge.nextNodeId}
                                onChange={(e) => updateEdge(node._id, idx, { nextNodeId: e.target.value })}
                                className="w-1/2 text-xs border-gray-300 rounded"
                              >
                                <option value="">-- Next Node --</option>
                                {nodes.filter(n => n._id !== node._id).map(n => (
                                  <option key={n._id} value={n._id}>
                                    {n.question ? n.question.substring(0,20) : n.rootCause?.substring(0,20)}
                                  </option>
                                ))}
                              </select>
                              <button onClick={() => removeEdge(node._id, idx)} className="text-red-500 hover:text-red-700">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
