import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ItemType = "ITEM";

const DraggableItem = ({ id, text, index, moveItem }) => {
	const [{ isDragging }, drag] = useDrag(() => ({
		type: ItemType,
		item: { id, index },
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
	}));

	const [, drop] = useDrop(() => ({
		accept: ItemType,
		hover: (item, monitor) => {
			if (!ref.current) {
				return;
			}
			const dragIndex = item.index;
			const hoverIndex = index;
			if (dragIndex === hoverIndex) {
				return;
			}
			moveItem(dragIndex, hoverIndex);
			item.index = hoverIndex;
		},
	}));

	const ref = React.useRef(null);
	const dragDropRef = drag(drop(ref));

	return (
		<div
			ref={dragDropRef}
			className={`p-2 mb-2 bg-white rounded shadow ${
				isDragging ? "opacity-50" : ""
			}`}
		>
			{text}
		</div>
	);
};

export default function Popup() {
	const [items, setItems] = useState([]);
	const [inputValue, setInputValue] = useState("");

	useEffect(() => {
		console.log("Hello from the popup!");
	}, []);

	const addItem = () => {
		if (inputValue.trim() !== "") {
			setItems([...items, { id: Date.now(), text: inputValue }]);
			setInputValue("");
		}
	};

	const moveItem = (dragIndex, hoverIndex) => {
		const newItems = [...items];
		const [reorderedItem] = newItems.splice(dragIndex, 1);
		newItems.splice(hoverIndex, 0, reorderedItem);
		setItems(newItems);
	};

	return (
		<DndProvider backend={HTML5Backend}>
			<div className="p-4 min-w-[300px]">
				<img
					src="/icon-with-shadow.svg"
					alt="Logo"
					className="w-16 h-16 mb-4"
				/>
				<h1 className="text-2xl font-bold mb-4">
					vite-plugin-web-extension
				</h1>
				<p className="mb-4">
					Template:{" "}
					<code className="bg-gray-200 p-1 rounded">react-js</code>
				</p>
				<div className="flex mb-4">
					<input
						type="text"
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						className="flex-grow px-2 py-1 border rounded-l"
						placeholder="Enter item name"
					/>
					<button
						onClick={addItem}
						className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
					>
						+
					</button>
				</div>
				<div>
					{items.map((item, index) => (
						<DraggableItem
							key={item.id}
							id={item.id}
							text={item.text}
							index={index}
							moveItem={moveItem}
						/>
					))}
				</div>
			</div>
		</DndProvider>
	);
}
