const mapValues = require("lodash/mapValues");
const isEqual = require("lodash/isEqual");

type HeapNode = {
    frequency: number;
}

type CharNode = HeapNode & {
    character: string;
} & {
    parent?: TreeNode;
};

function isCharNode(node: TreeNode): node is CharNode {
    return node.hasOwnProperty("character");
}

type HuffNode = HeapNode & {
    left: TreeNode;
    right: TreeNode;
} & {
    parent?: TreeNode;
};

type TreeNode = (CharNode | HuffNode)

class HuffmanTree {
    root: TreeNode;
    bitMap: number[];
    output: string[];
    constructor(newRoot: TreeNode) {
        this.root = newRoot;
        this.bitMap = [];
        this.output = [];
    }

    decode() {
        const tempBitMap = [...this.bitMap];

        while (tempBitMap.length > 0) {
            this.#findNode(this.root, tempBitMap);
        }
    }

    encode(charMap: CharNode[], text: string) {
        for (const character of text) {
            this.#findPath(charMap[character.charCodeAt(0)], undefined)
        }
    }

    #findNode(subTree: TreeNode, tempBitMap: number[]) {
        if (!subTree) {
            return;
        }

        if (isCharNode(subTree)) {
            this.output.push(subTree.character);
            return;
        }

        const last: number = tempBitMap[0];
        tempBitMap.shift();
        if (last === 1) {
            this.#findNode(subTree.left, tempBitMap);
        } else {
            this.#findNode(subTree.right, tempBitMap);
        }
    }

    #findPath(subTree: any, last: TreeNode | undefined) {
        if (!subTree) {
            return;
        }

        this.#findPath(subTree.parent, subTree);

        if (!last) {
            return;
        }

        this.bitMap.push(last === subTree.left ? 1 : 0);
    }


    #printHelper(subTree: TreeNode, indent: number) {
        if (!subTree) {
            return;
        }

        if (isCharNode(subTree)) {
            let indents = "";
            while (indent > 0) {
                indents += "\t";
                indent--;
            }
            console.log(indents, subTree.character)
            return;
        }

        this.#printHelper(subTree.left, indent + 1);
        let indents = "";
        while (indent > 0) {
            indents += "\t";
            indent--;
        }

        console.log(indents, subTree.frequency)
        this.#printHelper(subTree.right, indent + 1);
    }

    printTree() {
        this.#printHelper(this.root, 0);
    }
}

class Heap<T extends HeapNode> {
    #items: T[] = [];

    add(newItem: T) {
        this.#items.push(newItem);
        this.#heapify();
    }

    peek() {
        return this.#items[0];
    }

    pop() {
        this.#items.shift();
    }

    size() {
        return this.#items.length;
    }

    #heapify() {
        let childIndex: number = this.#items.length - 1;
        let parentIndex: number = Math.floor((childIndex - 1) / 2);
        while (parentIndex >= 0) {
            const child: T = this.#items[childIndex];
            const parent: T = this.#items[parentIndex];
            if (child.frequency < parent.frequency) {
                this.#items[childIndex] = parent;
                this.#items[parentIndex] = child;
            }
            childIndex = parentIndex;
            parentIndex = Math.floor((childIndex - 1) / 2);
        }
    }
}

function getFrequency(parent: string, character: string) {
    let count = 0;
    for (const char of parent) {
        if (char === character) count++;
    }
    return count;
}

function compressText(text: string) {
    const charNodes: CharNode[] = parseText(text);

    const minHeap = new Heap<TreeNode>();
    for (const node of charNodes) {
        if (node) {
            minHeap.add(node);
        }
    }


    while (minHeap.size() > 1) {
        const left = minHeap.peek();
        minHeap.pop();
        const right = minHeap.peek();
        minHeap.pop();

        const newNode: HuffNode = {
            frequency: left.frequency + right.frequency,
            left,
            right,
        }

        left.parent = newNode;
        right.parent = newNode;

        minHeap.add(newNode);
    }

    const huffTree = new HuffmanTree(minHeap.peek());


    huffTree.encode(charNodes, text);
    console.log(huffTree.bitMap);
    huffTree.decode();
    console.log(huffTree.output);
}

function parseText(text: string): CharNode[] {
    const characters: string[] = text.split("");

    const charFrequencies: CharNode[] = [];

    characters.forEach((char: string) => {
        const byte = char.charCodeAt(0);
        if (!charFrequencies[byte]) {
            charFrequencies[byte] = {
                character: char,
                frequency: getFrequency(text, char),
            }
        }
    });

    console.log(charFrequencies);
    return charFrequencies;
}

compressText();