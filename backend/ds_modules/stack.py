class Stack:
    def __init__(self):
        self.items = []

    def push(self, item):
        """O(1) Push item"""
        self.items.append(item)

    def pop(self):
        """O(1) Pop item"""
        if not self.is_empty():
            return self.items.pop()
        return None

    def peek(self):
        """O(1) Peek top item"""
        if not self.is_empty():
            return self.items[-1]
        return None

    def is_empty(self):
        return len(self.items) == 0

    def size(self):
        return len(self.items)
