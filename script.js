class SortingVisualizer {
    constructor() {
        this.numbers = [];
        this.stopSorting = false;
        this.isSorting = false;
        this.animationSpeed = 50;
        this.barColor = '#0066cc';
        this.highlightColor = '#ff0000';
        this.isFullscreen = false;
        this.isDarkMode = false;
        
        // Algorithm information
        this.algorithmInfo = {
            bubble: {
                title: 'Bubble Sort',
                bestTime: 'O(n)',
                avgTime: 'O(n²)',
                worstTime: 'O(n²)',
                spaceComplexity: 'O(1)',
                description: 'Bubble Sort repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. The pass through the list is repeated until no swaps are needed.',
                useCases: [
                    'Educational purposes to understand basic sorting concepts',
                    'Small datasets where simplicity is preferred over efficiency',
                    'When memory space is very limited',
                    'When the data is nearly sorted'
                ]
            },
            insertion: {
                title: 'Insertion Sort',
                bestTime: 'O(n)',
                avgTime: 'O(n²)',
                worstTime: 'O(n²)',
                spaceComplexity: 'O(1)',
                description: 'Insertion Sort builds the final sorted array one item at a time. It iterates through an input array and removes one element per iteration, finds the location it belongs to in the sorted list, and inserts it there.',
                useCases: [
                    'Small datasets where simplicity is preferred',
                    'Nearly sorted arrays',
                    'Online sorting (sorting data as it is received)',
                    'When memory is limited'
                ]
            },
            selection: {
                title: 'Selection Sort',
                bestTime: 'O(n²)',
                avgTime: 'O(n²)',
                worstTime: 'O(n²)',
                spaceComplexity: 'O(1)',
                description: 'Selection Sort divides the input list into a sorted and an unsorted region. It repeatedly selects the smallest element from the unsorted region and adds it to the sorted region.',
                useCases: [
                    'Small lists where simplicity is desired',
                    'When memory space is limited',
                    'When the cost of swapping elements is high',
                    'When checking all elements is compulsory'
                ]
            },
            merge: {
                title: 'Merge Sort',
                bestTime: 'O(n log n)',
                avgTime: 'O(n log n)',
                worstTime: 'O(n log n)',
                spaceComplexity: 'O(n)',
                description: 'Merge Sort is a divide-and-conquer algorithm that recursively breaks down a problem into smaller, more manageable subproblems until they become simple enough to solve directly.',
                useCases: [
                    'Large datasets where consistent performance is required',
                    'External sorting of large files',
                    'When stable sorting is needed',
                    'Parallel processing applications'
                ]
            },
            shell: {
                title: 'Shell Sort',
                bestTime: 'O(n log n)',
                avgTime: 'O(n log n)',
                worstTime: 'O(n²)',
                spaceComplexity: 'O(1)',
                description: 'Shell Sort is an optimization of insertion sort that allows the exchange of items that are far apart. It starts with larger gaps between elements and gradually reduces the gap.',
                useCases: [
                    'Medium-sized datasets',
                    'When in-place sorting is required',
                    'Systems with memory constraints',
                    'When quick implementation is needed with reasonable performance'
                ]
            },
            quick: {
                title: 'Quick Sort',
                bestTime: 'O(n log n)',
                avgTime: 'O(n log n)',
                worstTime: 'O(n²)',
                spaceComplexity: 'O(log n)',
                description: 'Quick Sort is a divide-and-conquer algorithm that picks an element as a pivot and partitions the array around it. Elements smaller than the pivot go to the left, larger ones to the right.',
                useCases: [
                    'Large datasets',
                    'When average-case performance is important',
                    'Internal sorting (when data fits in memory)',
                    'Virtual memory environments'
                ]
            },
            heap: {
                title: 'Heap Sort',
                bestTime: 'O(n log n)',
                avgTime: 'O(n log n)',
                worstTime: 'O(n log n)',
                spaceComplexity: 'O(1)',
                description: 'Heap Sort uses a binary heap data structure to sort elements. It first builds a max-heap, then repeatedly extracts the maximum element and rebuilds the heap until all elements are sorted.',
                useCases: [
                    'Large datasets requiring guaranteed O(n log n) performance',
                    'Systems with memory constraints',
                    'Priority queue implementations',
                    'When in-place sorting is required'
                ]
            }
        };
        
        // Get DOM elements
        this.canvas = document.getElementById('sorting-canvas');
        this.fullscreenCanvas = document.getElementById('fullscreen-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.fullscreenCtx = this.fullscreenCanvas.getContext('2d');
        this.numbersInput = document.getElementById('numbers-input');
        this.speedSlider = document.getElementById('speed-slider');
        this.stopBtn = document.getElementById('stop-btn');
        this.modal = document.getElementById('fullscreen-modal');
        this.themeToggleBtn = document.getElementById('theme-toggle-btn');
        this.algorithmModal = document.getElementById('algorithm-info-modal');
        
        this.sizeSlider = document.getElementById('size-slider');
        this.arraySize = parseInt(this.sizeSlider.value);
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Initialize theme
        this.initializeTheme();
    }

    initializeTheme() {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            this.toggleTheme(true);
        }
    }

    toggleTheme(isDark) {
        this.isDarkMode = isDark ?? !this.isDarkMode;
        document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
        localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
        
        // Update modal content background if in fullscreen
        if (this.isFullscreen) {
            const modalContent = document.querySelector('.modal-content');
            modalContent.style.background = this.isDarkMode ? 
                'linear-gradient(to bottom, #2d2d2d, #232323)' : 
                'linear-gradient(to bottom, #f8f9fa, #e9ecef)';
        }
        
        this.drawBars(); // Redraw with new theme colors
    }

    setupEventListeners() {
        document.getElementById('random-btn').addEventListener('click', () => this.generateRandom());
        document.getElementById('enter-btn').addEventListener('click', () => this.displayNumbers());
        this.stopBtn.addEventListener('click', () => this.stopAnimation());
        this.speedSlider.addEventListener('input', (e) => {
            // Invert the speed so higher value = faster
            this.animationSpeed = 101 - parseInt(e.target.value);
        });
        
        // Sorting algorithm buttons (main view)
        const algorithms = ['bubble', 'insertion', 'selection', 'merge', 'shell', 'quick', 'heap'];
        algorithms.forEach(algo => {
            const mainButton = document.getElementById(`${algo}-sort`);
            const fsButton = document.getElementById(`${algo}-sort-fs`);
            
            const clickHandler = () => {
                if (!this.isSorting) {
                    this.startSorting(this[`${algo}Sort`].bind(this));
                }
            };
            
            mainButton.addEventListener('click', clickHandler);
            fsButton.addEventListener('click', clickHandler);
        });

        // Fullscreen controls
        document.getElementById('expand-btn').addEventListener('click', () => this.toggleFullscreen(true));
        document.getElementById('collapse-btn').addEventListener('click', () => this.toggleFullscreen(false));
        
        // Close fullscreen when clicking outside the modal content
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.toggleFullscreen(false);
            }
        });

        // Theme toggle
        this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());

        // Algorithm info buttons
        document.querySelectorAll('.info-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const algorithm = e.currentTarget.dataset.algorithm;
                this.showAlgorithmInfo(algorithm);
            });
        });

        // Close algorithm modal
        document.querySelector('.close-modal-btn').addEventListener('click', () => {
            this.algorithmModal.classList.remove('active');
        });

        // Close modal when clicking outside
        this.algorithmModal.addEventListener('click', (e) => {
            if (e.target === this.algorithmModal) {
                this.algorithmModal.classList.remove('active');
            }
        });

        // Array generation buttons
        document.getElementById('random-btn').addEventListener('click', () => this.generateRandom());
        document.getElementById('nearly-sorted-btn').addEventListener('click', () => this.generateNearlySorted());
        document.getElementById('reverse-sorted-btn').addEventListener('click', () => this.generateReverseSorted());
        document.getElementById('few-unique-btn').addEventListener('click', () => this.generateFewUnique());
        
        // Array size control
        this.sizeSlider.addEventListener('input', (e) => {
            this.arraySize = parseInt(e.target.value);
            this.generateRandom(); // Regenerate array with new size
        });
    }

    toggleFullscreen(enter) {
        this.isFullscreen = enter;
        if (enter) {
            this.modal.classList.add('active');
            // Update modal content background based on theme
            const modalContent = document.querySelector('.modal-content');
            modalContent.style.background = this.isDarkMode ? 
                'linear-gradient(to bottom, #2d2d2d, #232323)' : 
                'linear-gradient(to bottom, #f8f9fa, #e9ecef)';
            this.resizeCanvas();
            this.drawBars();
        } else {
            this.modal.classList.remove('active');
            this.resizeCanvas();
            this.drawBars();
        }
    }

    resizeCanvas() {
        const canvas = this.isFullscreen ? this.fullscreenCanvas : this.canvas;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        this.drawBars();
    }

    generateRandom() {
        this.numbers = Array.from({length: this.arraySize}, () => Math.floor(Math.random() * 100) + 1);
        this.numbersInput.value = this.numbers.join(' ');
        this.drawBars();
    }

    generateNearlySorted() {
        // Generate sorted array
        this.numbers = Array.from({length: this.arraySize}, (_, i) => Math.floor((i / this.arraySize) * 100) + 1);
        
        // Swap some adjacent elements randomly
        const swaps = Math.floor(this.arraySize * 0.1); // Swap 10% of elements
        for (let i = 0; i < swaps; i++) {
            const index = Math.floor(Math.random() * (this.arraySize - 1));
            [this.numbers[index], this.numbers[index + 1]] = [this.numbers[index + 1], this.numbers[index]];
        }
        
        this.numbersInput.value = this.numbers.join(' ');
        this.drawBars();
    }

    generateReverseSorted() {
        this.numbers = Array.from({length: this.arraySize}, (_, i) => 
            Math.floor(((this.arraySize - i) / this.arraySize) * 100) + 1
        );
        this.numbersInput.value = this.numbers.join(' ');
        this.drawBars();
    }

    generateFewUnique() {
        const uniqueValues = [10, 30, 50, 70, 90]; // 5 unique values
        this.numbers = Array.from({length: this.arraySize}, () => 
            uniqueValues[Math.floor(Math.random() * uniqueValues.length)]
        );
        this.numbersInput.value = this.numbers.join(' ');
        this.drawBars();
    }

    displayNumbers() {
        try {
            const input = this.numbersInput.value.trim();
            if (!input) {
                this.generateRandom();
                return;
            }
            
            this.numbers = input.split(/\s+/).map(x => parseInt(x));
            if (this.numbers.some(isNaN)) {
                throw new Error('Please enter valid numbers');
            }
            if (this.numbers.length > 50) {
                throw new Error('Please enter 50 or fewer numbers');
            }
            this.drawBars();
        } catch (e) {
            alert(e.message);
        }
    }

    drawBars(highlight = []) {
        const canvas = this.isFullscreen ? this.fullscreenCanvas : this.canvas;
        const ctx = this.isFullscreen ? this.fullscreenCtx : this.ctx;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (!this.numbers.length) return;

        const barWidth = (canvas.width - 20) / this.numbers.length;
        const maxHeight = canvas.height - 50;
        const maxVal = Math.max(...this.numbers);

        for (let i = 0; i < this.numbers.length; i++) {
            const height = (this.numbers[i] / maxVal) * maxHeight;
            const x = i * barWidth + 10;
            const y = canvas.height - height - 10;

            // Create gradient
            const gradient = ctx.createLinearGradient(x, y, x, y + height);
            if (highlight.includes(i)) {
                gradient.addColorStop(0, '#ff6b6b');
                gradient.addColorStop(1, '#ff4757');
                ctx.shadowColor = '#ff4757';
                ctx.shadowBlur = 15;
            } else {
                gradient.addColorStop(0, '#4d94ff');
                gradient.addColorStop(1, '#0066cc');
                ctx.shadowColor = 'rgba(0, 102, 204, 0.5)';
                ctx.shadowBlur = 5;
            }

            // Draw bar with rounded corners
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth - 1, height, 4);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Reset shadow for text
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;

            // Draw value with theme-appropriate text color
            ctx.fillStyle = this.isDarkMode ? '#e0e0e0' : '#333';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.numbers[i].toString(), x + barWidth/2, y - 5);
        }
    }

    async startSorting(sortFunction) {
        if (this.isSorting) return; // Prevent multiple sorts
        this.isSorting = true;
        this.stopSorting = false;
        this.stopBtn.disabled = false;
        await sortFunction();
        this.stopBtn.disabled = true;
        this.isSorting = false;
    }

    stopAnimation() {
        this.stopSorting = true;
        this.isSorting = false;
        this.stopBtn.disabled = true;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, Math.max(5, ms))); // Ensure minimum delay of 5ms
    }

    // Sorting Algorithms
    async bubbleSort() {
        const n = this.numbers.length;
        for (let i = 0; i < n; i++) {
            if (this.stopSorting) return;
            for (let j = 0; j < n - i - 1; j++) {
                if (this.stopSorting) return;
                if (this.numbers[j] > this.numbers[j + 1]) {
                    [this.numbers[j], this.numbers[j + 1]] = [this.numbers[j + 1], this.numbers[j]];
                    this.drawBars([j, j + 1]);
                    await this.sleep(this.animationSpeed);
                }
            }
        }
        this.drawBars();
    }

    async insertionSort() {
        for (let i = 1; i < this.numbers.length; i++) {
            if (this.stopSorting) return;
            let key = this.numbers[i];
            let j = i - 1;
            while (j >= 0 && this.numbers[j] > key) {
                if (this.stopSorting) return;
                this.numbers[j + 1] = this.numbers[j];
                j--;
                this.drawBars([j + 1, j + 2]);
                await this.sleep(this.animationSpeed);
            }
            this.numbers[j + 1] = key;
            this.drawBars([j + 1]);
            await this.sleep(this.animationSpeed);
        }
        this.drawBars();
    }

    async selectionSort() {
        const n = this.numbers.length;
        for (let i = 0; i < n; i++) {
            if (this.stopSorting) return;
            let minIdx = i;
            for (let j = i + 1; j < n; j++) {
                if (this.stopSorting) return;
                if (this.numbers[j] < this.numbers[minIdx]) {
                    minIdx = j;
                }
                this.drawBars([j, minIdx]);
                await this.sleep(this.animationSpeed);
            }
            [this.numbers[i], this.numbers[minIdx]] = [this.numbers[minIdx], this.numbers[i]];
            this.drawBars([i, minIdx]);
            await this.sleep(this.animationSpeed);
        }
        this.drawBars();
    }

    async mergeSort() {
        await this.mergeSortHelper(0, this.numbers.length - 1);
        this.drawBars();
    }

    async mergeSortHelper(start, end) {
        if (start >= end) return;
        if (this.stopSorting) return;

        const mid = Math.floor((start + end) / 2);
        await this.mergeSortHelper(start, mid);
        await this.mergeSortHelper(mid + 1, end);
        await this.merge(start, mid, end);
    }

    async merge(start, mid, end) {
        const left = this.numbers.slice(start, mid + 1);
        const right = this.numbers.slice(mid + 1, end + 1);
        let i = 0, j = 0, k = start;

        while (i < left.length && j < right.length) {
            if (this.stopSorting) return;
            if (left[i] <= right[j]) {
                this.numbers[k] = left[i];
                i++;
            } else {
                this.numbers[k] = right[j];
                j++;
            }
            this.drawBars([k]);
            await this.sleep(this.animationSpeed);
            k++;
        }

        while (i < left.length) {
            if (this.stopSorting) return;
            this.numbers[k] = left[i];
            this.drawBars([k]);
            await this.sleep(this.animationSpeed);
            i++;
            k++;
        }

        while (j < right.length) {
            if (this.stopSorting) return;
            this.numbers[k] = right[j];
            this.drawBars([k]);
            await this.sleep(this.animationSpeed);
            j++;
            k++;
        }
    }

    async shellSort() {
        const n = this.numbers.length;
        for (let gap = Math.floor(n/2); gap > 0; gap = Math.floor(gap/2)) {
            for (let i = gap; i < n; i++) {
                if (this.stopSorting) return;
                let temp = this.numbers[i];
                let j;
                for (j = i; j >= gap && this.numbers[j - gap] > temp; j -= gap) {
                    if (this.stopSorting) return;
                    this.numbers[j] = this.numbers[j - gap];
                    this.drawBars([j, j - gap]);
                    await this.sleep(this.animationSpeed);
                }
                this.numbers[j] = temp;
                this.drawBars([j]);
                await this.sleep(this.animationSpeed);
            }
        }
        this.drawBars();
    }

    async quickSort() {
        await this.quickSortHelper(0, this.numbers.length - 1);
        this.drawBars();
    }

    async quickSortHelper(low, high) {
        if (low < high) {
            if (this.stopSorting) return;
            const pivotIndex = await this.partition(low, high);
            await this.quickSortHelper(low, pivotIndex - 1);
            await this.quickSortHelper(pivotIndex + 1, high);
        }
    }

    async partition(low, high) {
        const pivot = this.numbers[high];
        let i = low - 1;

        for (let j = low; j < high; j++) {
            if (this.stopSorting) return i + 1;
            if (this.numbers[j] < pivot) {
                i++;
                [this.numbers[i], this.numbers[j]] = [this.numbers[j], this.numbers[i]];
                this.drawBars([i, j]);
                await this.sleep(this.animationSpeed);
            }
        }
        [this.numbers[i + 1], this.numbers[high]] = [this.numbers[high], this.numbers[i + 1]];
        this.drawBars([i + 1, high]);
        await this.sleep(this.animationSpeed);
        return i + 1;
    }

    async heapSort() {
        const n = this.numbers.length;

        // Build max heap
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            if (this.stopSorting) return;
            await this.heapify(n, i);
        }

        // Extract elements from heap one by one
        for (let i = n - 1; i > 0; i--) {
            if (this.stopSorting) return;
            [this.numbers[0], this.numbers[i]] = [this.numbers[i], this.numbers[0]];
            this.drawBars([0, i]);
            await this.sleep(this.animationSpeed);
            await this.heapify(i, 0);
        }
        this.drawBars();
    }

    async heapify(n, i) {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;

        if (left < n && this.numbers[left] > this.numbers[largest]) {
            largest = left;
        }

        if (right < n && this.numbers[right] > this.numbers[largest]) {
            largest = right;
        }

        if (largest !== i) {
            [this.numbers[i], this.numbers[largest]] = [this.numbers[largest], this.numbers[i]];
            this.drawBars([i, largest]);
            await this.sleep(this.animationSpeed);
            await this.heapify(n, largest);
        }
    }

    showAlgorithmInfo(algorithm) {
        const info = this.algorithmInfo[algorithm];
        if (!info) return;

        // Update modal content
        document.getElementById('algorithm-title').textContent = info.title;
        document.getElementById('best-time').textContent = info.bestTime;
        document.getElementById('avg-time').textContent = info.avgTime;
        document.getElementById('worst-time').textContent = info.worstTime;
        document.getElementById('space-complexity').textContent = info.spaceComplexity;
        document.getElementById('algorithm-description').textContent = info.description;

        // Update use cases
        const useList = document.getElementById('use-cases-list');
        useList.innerHTML = info.useCases.map(use => `<li>${use}</li>`).join('');

        // Show modal
        this.algorithmModal.classList.add('active');
    }
}

// Initialize the visualizer when the page loads
window.addEventListener('load', () => {
    new SortingVisualizer();
}); 