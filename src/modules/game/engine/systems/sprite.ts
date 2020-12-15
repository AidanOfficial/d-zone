import { Query, System } from 'ape-ecs'
import Sprite from '../components/sprite'
import PixiSprite from '../components/pixi-sprite'
import * as PIXI from 'pixi.js-legacy'
import type Renderer from '../../renderer'
import type { IPlugins } from '../../renderer'
import type { Viewport } from 'pixi-viewport'
import type { SpatialHash } from 'pixi-cull'
import type { Textures } from '../../typings'

export default class SpriteSystem extends System {
	private renderer!: Renderer
	private textures!: Textures
	private view!: Viewport<IPlugins>
	private cull!: SpatialHash
	private spriteQuery!: Query
	private spriteAddQuery!: Query
	private spriteRemoveQuery!: Query

	init(textures: Textures, renderer: Renderer) {
		this.textures = textures
		this.renderer = renderer
		this.view = this.renderer.view
		this.cull = this.renderer.cull
		this.spriteQuery = this.createQuery().fromAll(Sprite, PixiSprite).persist()
		this.spriteAddQuery = this.createQuery()
			.fromAll(Sprite)
			.not(PixiSprite)
			.persist()
		this.spriteRemoveQuery = this.createQuery()
			.fromAll(PixiSprite)
			.not(Sprite)
			.persist()
	}

	update(tick: number) {
		this.updatePixiSprites(tick)
		this.addPixiSprites()
		this.removePixiSprites()
	}

	updatePixiSprites(tick: number) {
		let updatedSprites = 0
		this.spriteQuery.execute().forEach((entity) => {
			if (entity.c[Sprite.key]._meta.updated !== tick) return
			const sprite = entity.c[Sprite.key] as Sprite
			const { sprite: pixiSprite } = entity.c[PixiSprite.key]
			pixiSprite.setTransform(sprite.x, sprite.y)
			pixiSprite.zIndex = sprite.zIndex
			pixiSprite.texture = this.textures[sprite.texture]
			pixiSprite.anchor = pixiSprite.texture.defaultAnchor
			this.cull.updateObject(pixiSprite)
			updatedSprites++
		})
		if (updatedSprites > 0) {
			this.cull.cull(this.view.getVisibleBounds())
		}
	}

	addPixiSprites() {
		this.spriteAddQuery.execute().forEach((entity) => {
			const sprite = entity.c[Sprite.key] as Sprite
			const pixiSprite = new PIXI.Sprite(this.textures[sprite.texture])
			pixiSprite.setTransform(sprite.x, sprite.y)
			pixiSprite.zIndex = sprite.zIndex
			this.view.addChild(pixiSprite)
			entity.addComponent({
				type: PixiSprite.typeName,
				key: PixiSprite.key,
				sprite: pixiSprite,
			})
		})
	}

	removePixiSprites() {
		this.spriteRemoveQuery.execute().forEach((entity) => {
			const pixiSprite = entity.c[PixiSprite.key]
			this.view.removeChild(pixiSprite.value)
			pixiSprite.value.destroy()
			entity.removeComponent(pixiSprite)
		})
	}
}
