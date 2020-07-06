<?php
	/**
     * Макет окна товар добавлен в корзину
	 * @since 3.9
     * @copyright
     * @license
	 */


	$jshopConfig = JSFactory::getConfig();
    $image_path = '/components/com_jshopping/files/img_products/';

    $cartData = $this->params->get('cartData') ;
    $product = JSFactory::getTable('product', 'jshop');
    $product->load($cartData['product_id']);
    $product->Attributes = $product->getAttributes();

    # Получаем изображение товара по выбранным аттр.
    $this->attribs = $this->app->input->get('jshop_attr_id' , [] , 'ARRAY');
    $attributes = $product->getInitLoadAttribute($this->attribs);
    $images = $product->getImages();


    




	$addedProduct = [] ;

	foreach( $cartData['cart']->products as $product )
	{
		if( $product['product_id'] == $cartData['product_id'] )
		{
			$addedProduct = $product ;
		}#END IF
	}#END FOREACH








	$productLink = SEFLink('index.php?option=com_jshopping&controller=product&task=view&category_id=' . $addedProduct['category_id'].'&product_id=' . $addedProduct['product_id']  ,1);
	$cartLink = SEFLink('index.php?option=com_jshopping&controller=cart&task=view', 1, 1);






	?>
	<cart-content>
		<div class="cart-modal__inner">
			<p class="modal__title">Корзина</p>
			<ul class="cart-modal__list">
				<li class="cart-modal__item">
					<div class="cart-modal__item-flex">
                        <a class="cart-modal__picture" href="<?= $productLink ?>" title="<?= $addedProduct['product_name'] ?>">
							<img src="<?= $image_path.$images[0]->image_thumb ?>" alt="<?= $addedProduct['product_name'] ?>">
						</a>
                        <div class="cart-modal__item-desc">
                            Товар : <sapn><?=$addedProduct['product_name']?></sapn>
                        </div>
                        <div class="cart-modal__item-task">
                            Добавлен в корзину.
                        </div>
                    </div>

				</li>
			</ul>
            <div class="cart-modal__check-price">
                <span class="cart-modal__check-label">Итого:</span>
                <span>
							<?= formatprice( getPriceFromCurrency( $cartData['cart']->price_product )) ?>
						</span>
            </div>
			<div class="cart-modal__bottom">

				<a class="button button_color_gray cart-modal__bottom-continue">Продолжить покупки</a>
				<div class="cart-modal__check">

					<a class="button button_color_green cart-modal__check-button" href="<?= $cartLink ?>">
						<span class="button-inner">Оформить заказ</span>
					</a>
				</div>
			</div>
		</div>
	</cart-content>
<?php
	/*echo'<pre>';print_r( $cartData['cart']->price_product );echo'</pre>'.__FILE__.' '.__LINE__;
	die(__FILE__ .' '. __LINE__ );*/