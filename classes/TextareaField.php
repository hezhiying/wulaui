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

class TextareaField extends FormField {
	public function getName() {
		return _tr('Textarea@from');
	}

	public function render($opts = []) {
		$definition = $this->options;
		$id         = isset ($definition ['id']) ? $definition ['id'] : $definition ['name'];
		$row        = isset ($definition ['row']) ? $definition ['row'] : '3';

		$definition ['value'] = html_escape($definition ['value']);
		$readonly             = isset ($definition ['readonly']) ? ' readonly="readonly" ' : '';
		$disabled             = isset ($definition ['disabled']) ? ' disabled="disabled" ' : '';
		$placeholder          = isset ($definition ['placeholder']) ? ' placeholder="' . $definition ['placeholder'] . '" ' : '';
		$html []              = '<textarea id="' . $id . '" rows="' . $row . '"' . $readonly . $disabled . $placeholder . ' name="' . $this->name . '" class="form-control">' . $definition ['value'] . '</textarea>';

		return implode('', $html);
	}
}