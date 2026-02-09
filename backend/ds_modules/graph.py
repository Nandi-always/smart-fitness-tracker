class Graph:
    def __init__(self):
        self.adj_list = {}

    def add_vertex(self, vertex):
        """O(1) Add a new node"""
        if vertex not in self.adj_list:
            self.adj_list[vertex] = []

    def add_edge(self, v1, v2):
        """O(1) Add connection between nodes"""
        if v1 not in self.adj_list:
            self.add_vertex(v1)
        if v2 not in self.adj_list:
            self.add_vertex(v2)
        
        self.adj_list[v1].append(v2)
        # self.adj_list[v2].append(v1) # Uncomment for undirected

    def get_neighbors(self, vertex):
        """O(1) Get immediate connections"""
        return self.adj_list.get(vertex, [])

    def bfs(self, start_vertex):
        """O(V + E) Breadth First Search for recommendations"""
        visited = set()
        queue = [start_vertex]
        visited.add(start_vertex)
        result = []

        while queue:
            vertex = queue.pop(0)
            result.append(vertex)

            for neighbor in self.adj_list.get(vertex, []):
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        return result
