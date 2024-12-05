
const Algo = {
	Step: "step",
	Bresehnam: "bresenham",
	DDA: "dda",
	Circle: "circle",
}

class Grid {
	constructor(scale, canvas) {
		this._scale = scale
		this._canvas = canvas
		this._renderingContext = canvas.getContext('2d')
		this._drawGrid()
		this._canvas.addEventListener('click', this._clickListener(), false);
	}

	_scale
	_x = 0
	_y = 0
	_numbersSize = 10
	_xOffset
	_height
	_createdPoints = new Set()
	_manuallyClicked = []
	_rendering = undefined

	_drawGrid() {
		this._renderingContext.clearRect(0, 0, this._canvas.width, this._canvas.height)
		this._renderingContext.font = this._numbersSize.toString() + 'px serif'
		const m = Math.floor(this._canvas.height / this._scale)
		const xOffset = this._renderingContext.measureText(m.toString())
		// console.log(xOffset)
		this._xOffset = xOffset.width
		this._drawSquares(this._canvas.width - xOffset.width, this._canvas.height - this._numbersSize)
		this._drawDigits([xOffset.width, this._canvas.height - this._numbersSize])
		this._height = this._canvas.height - this._numbersSize
	}

	_drawSquares(width, height) {
		let ctx = this._canvas.getContext('2d')
		let xOffset = this._canvas.width - width
		const m = height / this._scale
		const n = width / this._scale
		for (let i = 0; i < m; ++i) {
			for (let j = 0; j < n; ++j) {
				ctx.strokeRect(xOffset + j * this._scale, height - (i + 1) * this._scale, this._scale, this._scale)
			}
		}
	}

	_drawDigits(zero) {
		const [x, y] = zero
		const m = Math.floor(y / this._scale)
		const n = Math.floor((this._canvas.width - x) / this._scale)
		this._renderingContext.fillText('O', 3, 500);
		this._renderingContext.fillText('Y', 6, 6);
		for (let i = 0; i < m; ++i) {
			this._renderingContext.fillText((i + this._y).toString(), 0, y - i * this._scale - (this._scale - this._numbersSize) / 2)
		}
		this._renderingContext.fillText('X', 493, 500);
		for (let i = 0; i < n; ++i) {
			this._renderingContext.fillText((i + this._x).toString(), i * this._scale + (this._scale + x) / 2, this._canvas.height)
		}
	}

	_getRectCoords(x, y) {
		return [this._xOffset + x * this._scale, this._height - (y + 1) * this._scale]
	}

	_getRectCoordsFromClick(x, y) {
		return [
			Math.floor((x - this._xOffset) / this._scale),
			Math.floor((this._height - y) / this._scale)
		]
	};

	_clickListener() {
		const self = this
		return async e => {
			if (self._rendering !== undefined) {
				await self._rendering
			}
			if (self._manuallyClicked.length === 2) {
				let toRemove = []
				for (let created of self._createdPoints) {
					let s = created.split(' ')
					let x = parseInt(s[0])
					let y = parseInt(s[1])
					toRemove.push([x, y])
				}
				for (let p of toRemove) {
					self.clearPixel(...p)
				}
				self._manuallyClicked = []
			}
			const rect = this._canvas.getBoundingClientRect()
			if (e.x - rect.left <= this._xOffset || e.y - rect.top > this._height) {
				return
			}
			let [x, y] = self._getRectCoordsFromClick(e.x - rect.left, e.y - rect.top)
			self._manuallyClicked.push({ 'x': x, 'y': y })
			if (this._createdPoints.has(x.toString() + ' ' + y.toString())) {
				self.clearPixel(x, y)
			} else {
				self.setPixel(x, y)
			}
			if (self._manuallyClicked.length === 2) {
				if (this._algo == Algo.Bresehnam) {
					this._rendering = bresenhamAlgorithm(self._manuallyClicked[0], self._manuallyClicked[1], this._sleepTime)
				} else if (this._algo == Algo.Step) {
					this._rendering = drawLineBySteps(self._manuallyClicked[0], self._manuallyClicked[1], this._sleepTime)
				} else if (this._algo == Algo.DDA) {
					this._rendering = ddaAlgorithm(self._manuallyClicked[0], self._manuallyClicked[1], this._sleepTime)
				} else if (this._algo == Algo.Circle) {
					this._rendering = circleAlgorithm(self._manuallyClicked[0], self._manuallyClicked[1], this._sleepTime)
				}
				await this._rendering
				this._rendering = undefined
			}
		}
	}

	width() {
		return this._canvas.width - this._xOffset
	}

	height() {
		return this._height
	}

	setPixel(x, y) {
		if (x < 0 || y < 0) {
			return
		}
		const [xRect, yRect] = this._getRectCoords(x, y)
		this._renderingContext.fillRect(xRect, yRect, this._scale, this._scale)
		this._createdPoints.add(x.toString() + ' ' + y.toString())
	}

	clearPixel(x, y) {
		if (x < 0 || y < 0) {
			return
		}
		const [xRect, yRect] = this._getRectCoords(x, y)
		this._renderingContext.clearRect(xRect, yRect, this._scale, this._scale)
		this._renderingContext.strokeRect(xRect, yRect, this._scale, this._scale)
		this._createdPoints.delete(x.toString() + ' ' + y.toString())
	}

	async setStart(x, y) {
		if (isNaN(x) || isNaN(y)) {
			return
		}
		if (this._rendering !== undefined) {
			await this._rendering
		}
		let temp = new Set()
		for (let p of this._createdPoints) {
			let spl = p.split(' ')
			let val = (parseInt(spl[0]) + this._x - x).toString() + ' ' + (parseInt(spl[1]) + this._y - y).toString()
			temp.add(val)
		}
		this._createdPoints = temp
		this._x = x
		this._y = y
		this._drawGrid()
		for (let p of this._createdPoints) {
			let spl = p.split(' ')
			this.setPixel(parseInt(spl[0]), parseInt(spl[1]))
		}
	}

	async setScale(newScale) {
		if (this._rendering !== undefined) {
			await this._rendering
		}
		this._scale = newScale
		this._drawGrid()
		for (let p of this._createdPoints) {
			let spl = p.split(' ')
			this.setPixel(parseInt(spl[0]), parseInt(spl[1]))
		}
	}

	async setSleepTime(value) {
		if (this._rendering !== undefined) {
			await this._rendering
		}
		this._sleepTime = value
	}

	useBresenham() {
		this._algo = Algo.Bresehnam
	}

	useByStep() {
		this._algo = Algo.Step
	}

	useDDA() {
		this._algo = Algo.DDA
	}

	useCircle() {
		this._algo = Algo.Circle
	}

	_canvas
	_renderingContext

	_sleepTime = 100
	_algo = Algo.Step
}

let grid = new Grid(
	50, document.getElementById('canvas')
)

function timeout(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function drawLineBySteps(start, end, sleepTime = 1) {
    const startTime = performance.now();
    let dx = end.x - start.x; 
    let dy = end.y - start.y; 
    let steps = Math.max(Math.abs(dx), Math.abs(dy)); 
    
    let xIncrement = dx / steps; 
    let yIncrement = dy / steps; 
    let x = start.x; 
    let y = start.y;

    for (let i = 0; i <= steps; i++) { 
        grid.setPixel(Math.round(x), Math.round(y)); 
        await timeout(sleepTime); 
        x += xIncrement; 
        y += yIncrement; 
    }

}


async function circleAlgorithm(center, point, sleepTime = 1) {
    const startTime = performance.now();

    let dx = point.x - center.x;
    let dy = point.y - center.y;
    let r = Math.round(Math.sqrt(dx * dx + dy * dy)); 
    let x = 0;
    let y = r;
    let delta = 1 - r; 

    async function drawSymmetricPixels(x, y) {
       
        await timeout(sleepTime);
        grid.setPixel(center.x + x, center.y + y); 
        grid.setPixel(center.x + x, center.y - y); 
        grid.setPixel(center.x - x, center.y + y); 
        grid.setPixel(center.x - x, center.y - y); 
        grid.setPixel(center.x + y, center.y + x);
        grid.setPixel(center.x + y, center.y - x); 
        grid.setPixel(center.x - y, center.y + x); 
        grid.setPixel(center.x - y, center.y - x); 
    }

   
    while (x <= y) {
        await drawSymmetricPixels(x, y);

        if (delta < 0) {
            delta += 2 * x + 3;
        } else {
            delta += 2 * (x - y) + 5;
            y--; 
        }
        x++; 
    }

    updateExecutionTime(performance.now() - startTime);
}


async function ddaAlgorithm(start, end, sleepTime = 1) {
    const startTime = performance.now();

    let dx = end.x - start.x;
    let dy = end.y - start.y;
    let steps = Math.max(Math.abs(dx), Math.abs(dy));

    let xIncrement = dx / steps;
    let yIncrement = dy / steps;


    let x = start.x;
    let y = start.y;

    for (let i = 0; i <= steps; i++) { 
        grid.setPixel(Math.round(x), Math.round(y)); 
        await timeout(sleepTime);

        x += xIncrement; 
        y += yIncrement; 
    }

    updateExecutionTime(performance.now() - startTime);
}


async function bresenhamAlgorithm(start, end, sleepTime = 1) {
    const startTime = performance.now();

    let dx = Math.abs(end.x - start.x);
    let dy = Math.abs(end.y - start.y);

    let sx = start.x < end.x ? 1 : -1;
    let sy = start.y < end.y ? 1 : -1;

    
    let x = start.x;
    let y = start.y;

   
    let err = dx - dy;

    while (true) {
        grid.setPixel(x, y); 
        await timeout(sleepTime);
        if (x === end.x && y === end.y) break;

    
        let e2 = 2 * err;

        if (e2 > -dy) {
            err -= dy;
            x += sx;
        }

        if (e2 < dx) {
            err += dx;
            y += sy;
        }
    }

    updateExecutionTime(performance.now() - startTime);
}


async function updateCoordsX(e) {
	await grid.setStart(parseInt(e.target.value), grid._y)
}

async function updateCoordsY(e) {
	await grid.setStart(grid._x, parseInt(e.target.value))
}

async function updateScale(e) {
	await grid.setScale(parseInt(e.target.value))
	document.getElementById('range-value').innerText = e.target.value
}

async function updateSleepTime(e) {
	await grid.setSleepTime(parseInt(e.target.value))
	document.getElementById('sleep-value').innerText = e.target.value + 'мс'
}

async function updateAlgo(s) {
	if (s.value === 'step') {
		await grid.useByStep()
	} else if (s.value === 'bresenham') {
		await grid.useBresenham()
	} else if (s.value === 'dda') {
		await grid.useDDA()
	} else if (s.value == 'circle') {
		await grid.useCircle()
	} else {
		await grid.useBresenham()
	}
}

async function test(_x0, _x1, _y0, _y1, iter, func, annotation) {
	console.log(`${annotation} test...`)
	function rand(mn, mx) {
		return Math.round(Math.random() * (mx - mn) + mn)
	}
	let b = Date.now()
	for (let i = 0; i < iter; ++i) {
		let x0 = rand(_x0, _x1)
		let y0 = rand(_y0, _y1)
		let x1 = rand(_x0, _x1)
		let y1 = rand(_y0, _y1)
		if (x1 == x0 && y1 == y0) {
			--i
			continue
		}
		let start = {
			x: x0,
			y: y0
		}
		let end = {
			x: x1,
			y: y1
		}
		await func(start, end, 0)
	}
	let e = Date.now()
	let diff = (e - b)
	console.log(`${annotation}: ${diff / iter} ms`)
}

function updateExecutionTime(duration) {
	document.getElementById('execution-time').innerText = `${duration} ms`;
}

document.getElementById('x0').addEventListener('input', updateCoordsX)
document.getElementById('y0').addEventListener('input', updateCoordsY)
document.getElementById('scale-slider').addEventListener('input', updateScale)
