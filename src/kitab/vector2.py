class Vector2:

    DPMM = 3.78
    DPI = 96

    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __str__(self):
        return "(%s, %s)" % (self.x, self.y)

    def __add__(self, other):
        return Vector2(self.x + other.x, self.y + other.y)

    def __sub__(self, other):
        return Vector2(self.x - other.x, self.y - other.y)

    def __mul__(self, other):
        return Vector2(self.x * other, self.y * other)

    def __truediv__(self, other):
        return Vector2(self.x / other, self.y / other)

    def __eq__(self, other):
        return (self.x == other.x) and (self.y == other.y)

    def __iter__(self):
        return iter((self.x, self.y))

    def __round__(self, ndigits=None):
        return Vector2(round(self.x, ndigits), round(self.y, ndigits))

    def mm_to_pixels(self):
        return self * self.DPMM

    def pixels_to_mm(self):
        return self / self.DPMM

    def inches_to_pixels(self):
        return self * self.DPI

    def pixels_to_inches(self):
        return self / self.DPI

    def mm_to_inches(self):
        return self / 25.4

    def inches_to_mm(self):
        return self * 25.4

    def to_tuple(self):
        return (self.x, self.y)

    @classmethod
    def tuple_to_vector2(cls, tuple):
        return Vector2(tuple[0], tuple[1])