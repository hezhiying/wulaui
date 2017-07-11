<?php
/*
 * This file is part of wulacms.
 *
 * (c) Leo Ning <windywany@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace wula\ui\classes;

use wulaphp\form\FormField;

class PasswordField extends FormField {
	public function getName() {
		return _tr('Password@form');
	}

	public function render($opts = []) {
		return '';
	}

}