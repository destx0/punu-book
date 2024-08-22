import React, { useState, useEffect } from "react";
import { ArrowUp, ArrowDown, Edit2, Trash2 } from "lucide-react";

export default function Popup() {
	const [items, setItems] = useState([]);
	const [inputValue, setInputValue] = useState("");
	const [editingId, setEditingId] = useState(null);

	useEffect(() => {
		console.log("Hello from the popup!");
	}, []);

	const addItem = () => {
		if (inputValue.trim() !== "") {
			setItems([...items, { id: Date.now(), text: inputValue }]);
			setInputValue("");
		}
	};

	const moveItem = (index, direction) => {
		const newItems = [...items];
		const newIndex = index + direction;
		if (newIndex >= 0 && newIndex < newItems.length) {
			[newItems[index], newItems[newIndex]] = [
				newItems[newIndex],
				newItems[index],
			];
			setItems(newItems);
		}
	};

	const startEditing = (id, text) => {
		setEditingId(id);
		setInputValue(text);
	};

	const saveEdit = () => {
		if (inputValue.trim() !== "") {
			setItems(
				items.map((item) =>
					item.id === editingId ? { ...item, text: inputValue } : item
				)
			);
			setEditingId(null);
			setInputValue("");
		}
	};

	const deleteItem = (id) => {
		setItems(items.filter((item) => item.id !== id));
	};

	return (
		<div className="p-4 min-w-[300px]">
			<img
				src="/icon-with-shadow.svg"
				alt="Logo"
				className="w-16 h-16 mb-4"
			/>
			<h1 className="text-2xl font-bold mb-4">punu-book</h1>

			<div className="flex mb-4">
				<input
					type="text"
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					className="flex-grow px-2 py-1 border rounded-l"
					placeholder={
						editingId ? "Edit item name" : "Enter item name"
					}
				/>
				<button
					onClick={editingId ? saveEdit : addItem}
					className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
				>
					{editingId ? "Save" : "+"}
				</button>
			</div>
			<div>
				{items.map((item, index) => (
					<div
						key={item.id}
						className="flex items-center mb-2 bg-white rounded shadow p-2"
					>
						<span className="flex-grow">{item.text}</span>
						<button
							onClick={() => moveItem(index, -1)}
							className="p-1 mr-1 text-gray-600 hover:text-blue-600"
							disabled={index === 0}
						>
							<ArrowUp size={16} />
						</button>
						<button
							onClick={() => moveItem(index, 1)}
							className="p-1 mr-1 text-gray-600 hover:text-blue-600"
							disabled={index === items.length - 1}
						>
							<ArrowDown size={16} />
						</button>
						<button
							onClick={() => startEditing(item.id, item.text)}
							className="p-1 mr-1 text-gray-600 hover:text-green-600"
						>
							<Edit2 size={16} />
						</button>
						<button
							onClick={() => deleteItem(item.id)}
							className="p-1 text-gray-600 hover:text-red-600"
						>
							<Trash2 size={16} />
						</button>
					</div>
				))}
			</div>
		</div>
	);
}
