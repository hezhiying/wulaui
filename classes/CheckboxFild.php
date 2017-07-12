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
use wulaphp\form\FormTable;

class CheckboxFild extends FormField {
	public function __construct($name, FormTable $form, array $options = []) {
		$options['checkbox'] = true;
		parent::__construct($name, $form, $options);
	}

	public function getName() {
		return _tr('Checkbox@form');
	}

	public function renderWidget($opts = []) {
		$definition = $this->options;
		$id         = isset ($definition ['id']) ? $definition ['id'] : $this->name;
		$readonly   = isset ($definition ['readonly']) ? ' readonly="readonly" ' : '';
		$disabled   = isset ($definition ['disabled']) ? ' disabled="disabled" ' : '';
		$checked    = $this->value ? ' checked="checked" ' : '';
		$class      = isset ($definition ['class']) ? ' class="' . $definition['class'] . '" ' : '';

		return '<input id="' . $id . '" type="checkbox"' . $class . $readonly . $disabled . $checked . ' name="' . $this->name . '"/>';
	}
}