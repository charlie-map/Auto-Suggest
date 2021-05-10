# Auto Suggests

    CURRENT DESCRIPTION:
A tree project for inputting an initial word and giving you the most likely word.
This project is designed on top of a trie. The trie currently contains thousands of words, which are then inputted into the tree.

    TIME COMPLEXITY:
With the current version. Looking through the trie causes major issues when trying to use the type ahead mode. The type ahead currently has too broad of a spectrum, so the necessity of time will have to be refactored so the algorithm doesn't grab as many words.

The 2nd version is much faster. Due to the rapid way that the algorithm prunes the recursion tree causes a very large increase in complexity.

    VERSION V1.1 INITIAL (5/10):
This time around, the entire thing (besides and insertion) was rewritten. The main purpose was to scratch the amount of safety nets, which destroyed complexity. By using a rolling build distance, the complexity was easily minimized for finiding distance, but then, instead of O(n^2), it was constant time since there was just a check of if the current letter matched the opposing letter in the main word.