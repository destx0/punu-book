import React from "react";
import PlaylistManager from "./PlaylistManager";

export default function Popup() {
	return (
		<div className="p-4 min-w-[300px]">
			<h1 className="text-2xl font-bold mb-4">Punu Book</h1>
			<PlaylistManager />
		</div>
	);
}
