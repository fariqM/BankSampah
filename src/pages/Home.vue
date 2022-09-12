<template>
	<q-page class="">
		<div class="bg-orange text-white">
			<q-toolbar>
				<q-toolbar-title>Muchammad Fariq - Nasabah</q-toolbar-title>
			</q-toolbar>
			<q-toolbar>
				<q-input
					rounded
					outlined
					dense
					style="width: 100%"
					placeholder="Cari data sampah"
				>
					<template v-slot:append>
						<q-avatar>
							<q-icon name="mdi-magnify" size="1.4rem" />
						</q-avatar>
					</template>
				</q-input>
			</q-toolbar>
		</div>
		<div class="q-pa-md scroll" :style="{ height: pageHeight }">
			<q-pull-to-refresh @refresh="refresh">
				<div v-for="(item, index) in items" :key="index" class="q-mb-sm">
					<q-badge color="secondary">
						{{ items.length - index }}
					</q-badge>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
					eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
					minim veniam, quis nostrud exercitation ullamco laboris nisi ut
					aliquip ex ea commodo consequat. Duis aute irure dolor in
					reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
					pariatur.
				</div>
			</q-pull-to-refresh>
		</div>
	</q-page>
</template>

<script>
import { Keyboard } from "@capacitor/keyboard";

export default {
	data: () => ({
		items: [{}, {}, {}, {}, {}, {}, {}, {}, {}],
		pageHeight: "calc(100vh - 160px)",
	}),
	mounted() {
		Keyboard.addListener("keyboardWillShow", (info) => {
			this.pageHeight = "calc(100vh - 100px)";
		});
		Keyboard.addListener("keyboardDidHide", () => {
			this.pageHeight = "calc(100vh - 160px)";
		});
	},
	methods: {
		refresh(done) {
			setTimeout(() => {
				this.items.push({}, {}, {}, {}, {}, {}, {});
				done();
			}, 1000);
		},
	},
};
</script>
