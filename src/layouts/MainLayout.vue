<template>
	<q-layout>
		<q-page-container>
			<router-view />
			<bottom-nav :options="options" v-model="value" v-if="!keyboardOpen" />
		</q-page-container>
	</q-layout>
</template>

<script>
import BottomNav from "../components/BotNav.vue";
import "../components/Botnav.css";
import { Keyboard } from "@capacitor/keyboard";

export default {
	components: {
		BottomNav,
	},
	data() {
		return {
			value: "home",
			keyboardOpen: false,
			options: [
				{
					id: "home",
					icon: "mdi-home-outline",
					title: "Data Sampah",
					path: { name: "home" },
				},
				{
					id: "poll",
					icon: "mdi-cube-send",
					title: "Setor",
					path: { name: "tes1" },
				},
				{
					id: "tes",
					icon: "mdi-vote-outline",
					title: "Tarik",
					path: { name: "tes2" },
				},
			],
		};
	},
	mounted() {
		Keyboard.addListener("keyboardWillShow", (info) => {
			this.keyboardOpen = true;
		});
		Keyboard.addListener("keyboardDidHide", () => {
			this.keyboardOpen = false;
		});
	},
	selected: {
		set: function (newVal) {
			return newVal;
		},
		get: function () {
			return this.$route.name;
		},
	},
};
</script>
