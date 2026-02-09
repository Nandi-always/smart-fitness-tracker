class MaxHeap:
    def __init__(self):
        self.heap = []

    def push(self, item):
        """O(log N) Insert item with priority. Item should be (priority, data)"""
        self.heap.append(item)
        self._sift_up(len(self.heap) - 1)

    def pop(self):
        """O(log N) Remove and return highest priority item"""
        if not self.heap:
            return None
        if len(self.heap) == 1:
            return self.heap.pop()
        
        root = self.heap[0]
        self.heap[0] = self.heap.pop()
        self._sift_down(0)
        return root

    def peek(self):
        """O(1) View highest priority item"""
        return self.heap[0] if self.heap else None

    def _sift_up(self, idx):
        parent = (idx - 1) // 2
        # Max Heap: Swap if child is GREATER than parent
        if parent >= 0 and self.heap[idx][0] > self.heap[parent][0]:
            self.heap[idx], self.heap[parent] = self.heap[parent], self.heap[idx]
            self._sift_up(parent)

    def _sift_down(self, idx):
        largest = idx
        left = 2 * idx + 1
        right = 2 * idx + 2

        # Max Heap: Find the largest among parent and children
        if left < len(self.heap) and self.heap[left][0] > self.heap[largest][0]:
            largest = left
        if right < len(self.heap) and self.heap[right][0] > self.heap[largest][0]:
            largest = right

        if largest != idx:
            self.heap[idx], self.heap[largest] = self.heap[largest], self.heap[idx]
            self._sift_down(largest)
