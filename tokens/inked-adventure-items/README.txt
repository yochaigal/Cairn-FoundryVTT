
--------------------------------------------------------------------------------
	Contents
--------------------------------------------------------------------------------

- Introduction & Contact
- License
- File Index
- Sizes & Variants
- Modifications
- Item Index & Tags

--------------------------------------------------------------------------------
	Introduction & Contact
--------------------------------------------------------------------------------

Hey there!

Thank you for buying Inked Adventure Items! It actually means a lot to me! I
hope you have fun prototyping games with it or using them either the way they
are provided or as a template for your game projects. If you encounter any
problem, got a question or have some feedback, you can reach me easily via mail
(see below).

By the way, I may add further items to this asset pack (at no additional cost)
in the future and if you want to keep up-to-date and learn more about my other
game-related projects, you can subscribe to my mailing list or join my Discord.

	Mailing List: 	http://mailinglist.stevencolling.com/game_assets/
	Discord:		http://discord.stevencolling.com
	Mail:			info@stevencolling.com
	Website:		http://www.stevencolling.com

See you there!
Steven Colling

--------------------------------------------------------------------------------
	License
--------------------------------------------------------------------------------

Depending on where you bought Inked Adventure Items, the store may provide
license terms for the assets they sell, including this one. If that's not the
case, you'll find a "License.txt" file in the topmost directory. Please refer
to either the storefront's asset license or to the license file provided with
the assets. If you think the seller's license is too restricting for your usage,
please reach out via mail: info@stevencolling.com.

--------------------------------------------------------------------------------
	File Index
--------------------------------------------------------------------------------

Depending on where you've bought the assets from, "Icons", "Item Backgrounds"
and "Sprite Sheets" may be in a "Assets" or "Content" folder, while the
documentation files are stored in a "Documentation" folder.

- Icons					
	- 32					
		- bw				32x32 icons in black and white.
		- grayscale			32x32 icons in grayscale.
		- light				32x32 icons with plain light gray filling.
		- lining			32x32 icons as linings (fully transparent).
		- white				32x32 icons with plain white filling.
	- 64					
		- bw				64x64 icons in black and white.
		- grayscale			64x64 icons in grayscale.
		- light				64x64 icons with plain light gray filling.
		- lining			64x64 icons as linings (fully transparent).
		- white				64x64 icons with plain white filling.
- Item Backgrounds			Handful of item icon backgrounds.
- Sprite Sheets				
	- 32					Sprite sheets for all variants in size 32x32.
	- 64					Sprite sheets for all variants in size 64x64.
- Changelog.txt				Log with all the updates the icons went through.
- Index.xml					Index file listing meta data for every icon.
- License.txt				Licensing information (this file might be missing
							depending on where you bought the assets from; refer
							to the License section above).
- README.txt				
- Showcase.kra				Krita source file with all the layers to reproduce
							or to modify the icons in all their variants.
- Showcase.psd				Photoshop source file (same as Krita source file).
- Showcase.png				Overview file showing off all the icons.
- Tutorial.htm				Tutorial file on how to handle the Krita source file
							and make modifications to the icons (or draw your own).

--------------------------------------------------------------------------------
	Sizes & Variants
--------------------------------------------------------------------------------

The icons are available as single files or compiled in a sprite sheet in the
sizes 32x32 pixels and 64x64 pixels, in the variants shown below. The "grayscale"
variant is recommended for the default use of the icons.

	Style Name	Proper Name			Colors	Description
	bw			Black and White		2		Lining filled with a light color and
											shades in solid black with light
											linings on top.
	grayscale	Grayscale/Mellow	4		Lining filled with medium color.
											Highlights with light color and
											shades with dark color.
	light		Light Filling		2		Lining filled with a light color.
	lining		Lining only			1		Lining with no fill (everything
											transparent except the lining).
	white		White Filling		2		Lining filled with white (#ffffff).

The colors in use are:

	#efefef		Light
	#cfcfcf		Medium
	#b8b8b8		Dark
	#454545		Lining

--------------------------------------------------------------------------------
	Modifications
--------------------------------------------------------------------------------

If you want to modify the existing icons or create new icons in the same style,
there's a Tutorial.htm file in the topmost directory for you! It refers to the
Showcase.kra file, a Krita file. Krita is an amazing (and free!) digital
painting software available at krita.org.

Warning: if you make changes to the files, please copy the files to a different
location first, before you download a new version of the assets and hence
accidentally overwriting your modifications!

--------------------------------------------------------------------------------
	Item Index & Tags
--------------------------------------------------------------------------------

Inked Adventure Items currently contains the following items:

	Category			Items
	
	Weapon				Sword, Wooden Shield, Iron Shield, Dagger, Rapier,
						Lance, Mace, Staff, Club, Boomerang, Bow, Arrow, Quiver,
						Bomb, Dynamite
	
	Tool				Axe, Saw, Pickaxe, Hammer, Shovel, Pitchfork,
						Fishing Rod, Mop, Sponge
	
	Equipment			Torch, Rope, Ladder, Campfire, Lantern, Map,
						Treasure Map, Compass, Letter, Envelope, Book,
						Empty Bottle, Bottle with a Message, Empty Potion,
						Potion, Small Empty Potion, Small Potion, Bandage,
						Candle, Mirror, Comb, Jar, Tent
						
	Inventory			Backpack, Sleeping Bag, Helmet, Glove, Armor (Chest),
						Boot, Crate, Barrel, Saddle
	
	Resource			Wood (Log), Plank (Wooden Board), Stick, Branch, Bark,
						Sawdust, Coal, Leaf, Stone, Rock, Flint, Ore, Ingots,
						Grass, Herbs, Root (Plant Root), Flower, Turf,
						Leather, Fur, Ball of Wool, Thread (Needle and Thread),
						Feather, Nail, Liquid (Water Drop), Manure, Ice Cube,
						Ghost, Heart, Heart Piece, Fairy, Beehive
						
	Food				Apple, Bread, Carrot, Beet, Walnut, Seeds, Meat, Fish,
						Egg, Broken Egg, Mushroom, Potato, Beer, Cheese, Honey
	
	Loot				Bone, Skull, Carcass, Fishbone, Worm, Eyeball,
						Tooth (Monster Tooth), Bee
	
	Treasure			Key, Boss Key, Coin, Coins, Treasure (Chest), Purse,
						Ring, Amulet, Flute, Die (6-sided), Playing Card (Ace
						of Spades), Diamond, Bust, Doll, Crystal

There's also an item index file called Index.xml in the topmost directory which
contains data about every item, including:

	Identifier			Data tag in lowercase and with underscores instead of
						empty spaces.
	Name				Readable name like shown in the showcase file.
	Description			A generic description of the item.
	Category			The category the item belongs to (see above).
	Tags				Series of tags applicable to the item (used tags are
						shown below).
	Comment				A description of what is seen in the icon (if minor
						details may too ambiguous at first).
	ShowcaseIndex		An index referring to the showcase file (see Showcase.png).
						"3;0" refers to the 4th icon from the left in the 1st line
						(as indices start from zero).
	SpriteSheetIndex	An index referring to the sprite sheet file
						(e.g. inked_adventure_items_grayscale.png).
	  
Depending on how you use the icons, you could read in the XML file in your game
project and use the "SpriteSheetIndex" to target a specific icon within the sprite
sheet. The "Name" and "Tags" fields may be helpful in finding specific icons.

The tags used in the index file are:

	Materials:			bone, meat, plant, leather, wool, paper, wooden, stone,
						metal, gem, glass, wax, cloth, strange
	Forms:				pile, bottle, liquid, smoke
	Loot:				coin, treasure, accessory, music, body_part
	Resources:			resource, food, fuel, light_source, explosive
	Equipment:			weapon, tool, armor, inventory, ammunition, chest
	Adventure:			message, navigation
	Misc:				animal, abstract

Here you go!