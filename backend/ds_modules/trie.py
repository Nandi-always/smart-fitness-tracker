class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end_of_word = False
        self.data = None  # Store full object data at leaf/end

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word, data=None):
        """O(L) Insert word where L is length of word"""
        node = self.root
        for char in word.lower():
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_end_of_word = True
        node.data = data if data else word

    def search_prefix(self, prefix):
        """O(L + M) Search words with prefix. M is total nodes in subtree."""
        node = self.root
        for char in prefix.lower():
            if char not in node.children:
                return []
            node = node.children[char]
        
        # DFS to find all words from this node
        results = []
        self._dfs(node, results)
        return results

    def _dfs(self, node, results):
        if node.is_end_of_word:
            results.append(node.data)
        
        for child in node.children.values():
            self._dfs(child, results)
