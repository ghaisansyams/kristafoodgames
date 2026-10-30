<?php

/*
|--------------------------------------------------------------------------
| Packaging Decision Lab catalog
|--------------------------------------------------------------------------
|
| Source of truth for the two Decision Lab journeys (Brand Owner and Packaging
| Converter), transcribed from the client's mind maps: every step, which options each
| step offers depending on earlier answers, and the product recommendations.
|
| The "traits" below drive the recommendation. Each option contributes traits (weight
| 1-3), each product has an affinity (0-3) per trait, and the product with the best
| weighted overlap wins. These weights are ILLUSTRATIVE game-model values — the mind
| maps list options and products but not the mapping between them — so they must be
| validated by the Foopak / Enza product team before the booth goes live. Edit the
| arrays here; the engine and UI need no changes.
|
*/

return [
    // Shown on the recommendation screen; `brand` selects the logo.
    'products' => [
        'foopak_bio_natura' => [
            'name' => 'Foopak Bio Natura',
            'brand' => 'foopak',
            'description' => 'Cups, bowls and food containers with a plastic-free coating.',
            'icon' => 'leaf',
            'affinity' => ['hot' => 2, 'cold' => 2, 'frozen' => 1, 'liquid' => 3, 'saucy' => 2, 'grease' => 2, 'plastic_free' => 3, 'food_contact' => 3, 'cup' => 3, 'bowl' => 3, 'box' => 2, 'print_quality' => 2, 'stiff' => 2, 'takeaway' => 2],
        ],
        'foopak_natura_cup' => [
            'name' => 'Foopak Natura Cup',
            'brand' => 'foopak',
            'description' => 'Hot and cold beverage cups.',
            'icon' => 'cup-soda',
            'affinity' => ['hot' => 3, 'cold' => 3, 'frozen' => 1, 'liquid' => 3, 'cup' => 3, 'print_quality' => 2, 'food_contact' => 3, 'stiff' => 2, 'plastic_free' => 1, 'takeaway' => 2],
        ],
        'foopak_natura_gloss' => [
            'name' => 'Foopak Natura Gloss',
            'brand' => 'foopak',
            'description' => 'Cups and bowls with a glossy finish.',
            'icon' => 'soup',
            'affinity' => ['hot' => 2, 'cold' => 2, 'frozen' => 2, 'liquid' => 2, 'cup' => 2, 'bowl' => 3, 'glossy' => 3, 'print_quality' => 3, 'retail_display' => 3, 'food_contact' => 3, 'stiff' => 2, 'plastic_free' => 1],
        ],
        'foopak_bio_container' => [
            'name' => 'Foopak Bio Container',
            'brand' => 'foopak',
            'description' => 'Sandwich boxes, salad boxes and food containers.',
            'icon' => 'package',
            'affinity' => ['hot' => 1, 'saucy' => 1, 'grease' => 2, 'box' => 3, 'plastic_free' => 3, 'food_contact' => 3, 'stiff' => 3, 'takeaway' => 3, 'retail_display' => 2],
        ],
        'foopak_pe_board' => [
            'name' => 'Foopak PE Board',
            'brand' => 'foopak',
            'description' => 'Takeaway meals, rice boxes, hot and gravy food.',
            'icon' => 'package',
            'affinity' => ['hot' => 3, 'saucy' => 3, 'liquid' => 2, 'grease' => 3, 'box' => 3, 'bowl' => 2, 'takeaway' => 3, 'stiff' => 3, 'food_contact' => 3, 'barrier' => 1],
        ],
        'foopak_greaseproof' => [
            'name' => 'Foopak Greaseproof Paper / Board',
            'brand' => 'foopak',
            'description' => 'Wrappers, liners and food bags for greasy foods.',
            'icon' => 'sandwich',
            'affinity' => ['grease' => 3, 'hot' => 2, 'wrap' => 3, 'bag' => 3, 'dry' => 2, 'plastic_free' => 2, 'food_contact' => 3, 'print_quality' => 2, 'box' => 1, 'takeaway' => 2],
        ],
        'enza_shield' => [
            'name' => 'Enza Shield',
            'brand' => 'enza',
            'description' => 'Flexible packaging, barrier and sealing applications.',
            'icon' => 'scroll',
            'affinity' => ['barrier' => 3, 'heat_seal' => 3, 'flexible_format' => 3, 'dry' => 3, 'powder' => 3, 'fragile' => 1, 'frozen' => 2, 'cold' => 1, 'storage' => 3, 'retail_display' => 2, 'print_quality' => 2, 'grease' => 2, 'liquid' => 1],
        ],
        'foopak_hardsize' => [
            'name' => 'Foopak Hardsize',
            'brand' => 'foopak',
            'description' => 'Food boxes, trays and confectionery packaging.',
            'icon' => 'boxes',
            'affinity' => ['box' => 3, 'dry' => 3, 'fragile' => 3, 'retail_display' => 3, 'print_quality' => 3, 'stiff' => 3, 'secondary' => 1, 'storage' => 2, 'food_contact' => 2],
        ],
        'sinar_board' => [
            'name' => 'Sinar Fold / Sinar Board / Sinar Vanda Hi-Brite',
            'brand' => 'foopak',
            'description' => 'General and secondary packaging.',
            'icon' => 'boxes',
            'affinity' => ['secondary' => 3, 'stiff' => 3, 'box' => 2, 'print_quality' => 3, 'storage' => 3, 'retail_display' => 2, 'dry' => 2, 'fragile' => 2],
        ],
    ],

    // slug => [label, traits (trait => weight), flags]. Slugs are unique across the catalog,
    // so the same option can be reused by several steps. Flags: icon, text (shows a free-text
    // field when picked), exclusive (clears every other pick in its step).
    'options' => [
        // Brand owner - step 1: product category.
        'beverages' => ['Beverages', ['liquid' => 2, 'cup' => 3], ['icon' => 'cup-soda']],
        'meals' => ['Meals & Prepared Foods', ['saucy' => 2, 'box' => 3, 'bowl' => 1], ['icon' => 'soup']],
        'fried' => ['Fried & Greasy Foods', ['grease' => 3, 'wrap' => 2], ['icon' => 'drumstick']],
        'bakery' => ['Bakery & Confectionery', ['dry' => 2, 'box' => 2, 'retail_display' => 1], ['icon' => 'cake']],
        'desserts' => ['Desserts & Frozen Treats', ['cold' => 2, 'frozen' => 1, 'cup' => 2, 'bowl' => 1], ['icon' => 'ice-cream-cone']],
        'dry_foods' => ['Dry Foods & Powdered Products', ['dry' => 3, 'powder' => 2, 'flexible_format' => 2], ['icon' => 'wheat']],
        'cat_other' => ['Other', [], ['icon' => 'ellipsis']],

        // Brand owner - step 2: product characteristics.
        'hot' => ['Hot', ['hot' => 3]],
        'cold' => ['Cold', ['cold' => 3]],
        'frozen' => ['Frozen', ['frozen' => 3, 'cold' => 1]],
        'liquid' => ['Liquid', ['liquid' => 3]],
        'semi_liquid' => ['Semi-Liquid', ['saucy' => 2, 'liquid' => 1]],
        'moist_saucy' => ['Moist or Saucy', ['saucy' => 3]],
        'moist' => ['Moist', ['saucy' => 1]],
        'moist_semi_liquid' => ['Moist or Semi-Liquid', ['saucy' => 3, 'liquid' => 1]],
        'oily_greasy' => ['Oily or Greasy', ['grease' => 3]],
        'dry' => ['Dry', ['dry' => 3]],
        'dry_crispy' => ['Dry or Crispy', ['dry' => 3]],
        'powdered' => ['Powdered', ['powder' => 3, 'dry' => 1]],
        'fragile' => ['Fragile or Easily Damaged', ['fragile' => 3]],
        'cold_frozen' => ['Cold or Frozen', ['cold' => 2, 'frozen' => 2]],
        'liquid_semi_liquid' => ['Liquid or Semi-Liquid', ['liquid' => 2, 'saucy' => 2]],
        'dry_powdered' => ['Dry or Powdered', ['dry' => 2, 'powder' => 2]],
        'char_other' => ['Other', []],

        // Brand owner - step 3: application & usage.
        'food_service' => ['Food Service', ['takeaway' => 1, 'stiff' => 1]],
        'dine_in' => ['Dine-In or Food Service', ['stiff' => 1]],
        'takeaway' => ['Takeaway', ['takeaway' => 3]],
        'delivery' => ['Delivery', ['takeaway' => 3]],
        'retail_distribution' => ['Retail Distribution', ['retail_display' => 2, 'barrier' => 1]],
        'wrapping_lining' => ['Food Wrapping or Lining Application', ['wrap' => 3]],
        'direct_sale' => ['Direct Product Sale', ['retail_display' => 1]],
        'storage_transport' => ['Storage or Transportation', ['storage' => 3]],
        'app_other' => ['Other', []],

        // Brand owner - step 4: key packaging priorities.
        'temperature' => ['Temperature Suitability', ['hot' => 2, 'cold' => 1]],
        'liquid_resistance' => ['Liquid Resistance', ['liquid' => 3]],
        'brand_presentation' => ['Brand Presentation', ['retail_display' => 2, 'print_quality' => 3, 'glossy' => 1]],
        'material_eol' => ['Material & End-of-Life Goals', ['plastic_free' => 3]],
        'barrier_protection' => ['Barrier & Product Protection', ['barrier' => 3, 'grease' => 1]],
        'grease_resistance' => ['Grease Resistance', ['grease' => 3]],
        'product_protection' => ['Product Protection', ['barrier' => 2, 'stiff' => 1, 'fragile' => 1]],
        'production_process' => ['Production & Packaging Process', ['stiff' => 1, 'print_quality' => 1]],
        'distribution' => ['Distribution Requirements', ['storage' => 3]],

        // Step 5 (both journeys): conditional specific requirements.
        'req_food_safety' => ['Food Safety & Food Contact', ['food_contact' => 3], ['icon' => 'shield-check']],
        'req_barrier' => ['Barrier & Product Protection', ['barrier' => 3], ['icon' => 'shield']],
        'req_printing' => ['Printing & Brand Presentation', ['print_quality' => 3, 'retail_display' => 1], ['icon' => 'image']],
        'req_production' => ['Production & Packaging Process', ['stiff' => 1, 'heat_seal' => 1], ['icon' => 'settings']],
        'req_material' => ['Material & Sustainability Goals', ['plastic_free' => 3], ['icon' => 'leaf']],
        'req_grade' => ['Specific Grade / Grammage / Size', ['stiff' => 1], ['icon' => 'sliders-horizontal']],
        'req_other' => ['Other Specific Requirements', [], ['icon' => 'file-text', 'text' => true]],
        'req_other_tech' => ['Other Requirements', [], ['icon' => 'file-text', 'text' => true]],
        'req_not_sure' => ['Not Sure Yet', [], ['icon' => 'circle-help', 'exclusive' => true]],

        // Converter - step 1: converting application.
        'conv_flexible' => ['Flexible Packaging', ['flexible_format' => 3, 'barrier' => 1], ['icon' => 'scroll']],
        'conv_wrapping' => ['Food Wrapping & Greaseproof Applications', ['wrap' => 3, 'grease' => 1], ['icon' => 'sandwich']],
        'conv_cups' => ['Paper Cups', ['cup' => 3], ['icon' => 'cup-soda']],
        'conv_bowls' => ['Paper Bowls', ['bowl' => 3], ['icon' => 'soup']],
        'conv_containers' => ['Food Containers, Lunch Boxes & Trays', ['box' => 3], ['icon' => 'package']],
        'conv_bags' => ['Paper Bags', ['bag' => 3], ['icon' => 'shopping-bag']],
        'conv_general' => ['General & Secondary Packaging', ['secondary' => 3], ['icon' => 'boxes']],
        'conv_other' => ['Other Converting Applications', [], ['icon' => 'ellipsis']],

        // Converter - step 2: converting process.
        'proc_lamination' => ['Lamination', ['barrier' => 1, 'flexible_format' => 1]],
        'proc_lamination_if_needed' => ['Lamination (if needed)', ['barrier' => 1]],
        'proc_lamination_optional' => ['Lamination (optional)', ['barrier' => 1]],
        'proc_coating' => ['Coating', ['barrier' => 1, 'grease' => 1]],
        'proc_print_flexo_gravure_offset' => ['Printing (Flexo/Gravure/Offset)', ['print_quality' => 2]],
        'proc_print_flexo_offset' => ['Printing (Flexo/Offset)', ['print_quality' => 2]],
        'proc_print_offset_flexo' => ['Printing (Offset/Flexo)', ['print_quality' => 2]],
        'proc_print' => ['Printing', ['print_quality' => 2]],
        'proc_slitting_rewinding' => ['Slitting & Rewinding', ['flexible_format' => 1]],
        'proc_slitting' => ['Slitting', ['wrap' => 1]],
        'proc_sheeting' => ['Sheeting', ['wrap' => 1]],
        'proc_pouch_making' => ['Pouch Making / Form-Fill-Seal', ['flexible_format' => 2, 'heat_seal' => 2]],
        'proc_bag_making' => ['Bag Making', ['bag' => 2]],
        'proc_bag_making_sos' => ['Bag Making (SOS/Satchel)', ['bag' => 2]],
        'proc_wrapper_liner' => ['Wrapper/Liner Converting', ['wrap' => 2]],
        'proc_cup_forming' => ['Cup Forming', ['cup' => 2]],
        'proc_bowl_forming' => ['Bowl Forming', ['bowl' => 2]],
        'proc_blanking_die_cutting' => ['Blanking & Die Cutting', ['stiff' => 1]],
        'proc_bottom_sealing' => ['Bottom Sealing', ['heat_seal' => 1]],
        'proc_rim_curling' => ['Rim Curling', ['stiff' => 1]],
        'proc_die_cutting' => ['Die Cutting', ['box' => 1]],
        'proc_folding_gluing' => ['Folding & Gluing', ['box' => 1, 'secondary' => 1]],
        'proc_tray_box_forming' => ['Tray/Box Forming', ['box' => 2]],
        'proc_handle_attachment' => ['Handle Attachment (optional)', ['bag' => 1]],
        'proc_bottom_gluing' => ['Bottom Gluing', ['bag' => 1]],
        'proc_reinforcement' => ['Reinforcement', ['bag' => 1]],
        'proc_finishing' => ['Finishing (Coating/Scoring)', ['print_quality' => 1]],
        'proc_other' => ['Other Converting Process', [], ['text' => true]],

        // Converter - step 3: material & performance requirements.
        'mat_barrier' => ['Barrier (Oxygen/Moisture)', ['barrier' => 3]],
        'mat_heat_sealability' => ['Heat Sealability', ['heat_seal' => 3]],
        'mat_grease_resistance' => ['Grease Resistance', ['grease' => 3]],
        'mat_grease_kit' => ['Grease Resistance (KIT Level)', ['grease' => 3]],
        'mat_water_resistance' => ['Water Resistance', ['liquid' => 2]],
        'mat_oil_moisture' => ['Oil & Moisture Resistance', ['grease' => 2, 'liquid' => 1]],
        'mat_liquid_resistance' => ['Liquid Resistance', ['liquid' => 3]],
        'mat_liquid_grease' => ['Liquid & Grease Resistance', ['liquid' => 2, 'grease' => 2]],
        'mat_grease_water' => ['Grease/Water Resistance', ['grease' => 2, 'liquid' => 2]],
        'mat_heat_hot_drinks' => ['Heat Resistance (Hot Drinks)', ['hot' => 3]],
        'mat_heat_hot_food' => ['Heat Resistance (Hot Food)', ['hot' => 3, 'saucy' => 1]],
        'mat_cold_resistance' => ['Cold Resistance', ['cold' => 3]],
        'mat_stiffness_formability' => ['Stiffness & Formability', ['stiff' => 3]],
        'mat_stiffness' => ['Stiffness', ['stiff' => 3]],
        'mat_formability' => ['Formability', ['stiff' => 2]],
        'mat_stiffness_rigidity' => ['Stiffness & Rigidity', ['stiff' => 3]],
        'mat_printability' => ['Printability', ['print_quality' => 3]],
        'mat_printability_high' => ['Printability (High Quality)', ['print_quality' => 3]],
        'mat_food_contact' => ['Food Contact Compliance', ['food_contact' => 3]],
        'mat_food_contact_if_required' => ['Food Contact (if required)', ['food_contact' => 1]],
        'mat_natural_pfas_free' => ['Natural/PFAS-free Option', ['plastic_free' => 3]],
        'mat_strength_tear' => ['Strength & Tear Resistance', ['bag' => 1, 'stiff' => 1]],
        'mat_surface_finish' => ['Surface Finish (Gloss/Matt)', ['glossy' => 3, 'print_quality' => 1]],
        'mat_folding_performance' => ['Folding Performance', ['box' => 1, 'secondary' => 2]],
        'mat_other' => ['Please specify requirements', [], ['text' => true]],

        // Converter - step 4: machine & production parameters (captured for the booth team's
        // follow-up; they refine the conversation rather than the product match).
        'mach_lamination_type' => ['Lamination Type (Dry/Wet)', []],
        'mach_coating_type' => ['Coating Type (Aqueous/Other)', []],
        'mach_printing_method' => ['Printing Method', []],
        'mach_speed' => ['Machine Speed', []],
        'mach_web_width' => ['Web Width / Roll Diameter', []],
        'mach_sheet_or_reel' => ['Sheet or Reel', []],
        'mach_grammage' => ['Grammage Range', []],
        'mach_slitting_sheeting' => ['Slitting/Sheeting Requirement', []],
        'mach_cup_size' => ['Cup Size Range (oz/ml)', []],
        'mach_cup_machine' => ['Machine Type (Single/Double PE)', []],
        'mach_blank_size' => ['Blank Size', []],
        'mach_bowl_size' => ['Bowl Size Range (ml)', []],
        'mach_machine_type' => ['Machine Type', []],
        'mach_box_size' => ['Box/Tray Size Range', []],
        'mach_die_cutting_method' => ['Die Cutting Method', []],
        'mach_folding_gluing_line' => ['Folding & Gluing Line', []],
        'mach_bag_type' => ['Bag Type (SOS/Satchel/Other)', []],
        'mach_bottom_type' => ['Bottom Type (Glued/Stitched)', []],
        'mach_handle' => ['Handle (Yes/No)', []],
        'mach_die_folding_line' => ['Die Cutting & Folding Line', []],
        'mach_surface_finish' => ['Surface Finish Requirement', []],
        'mach_other' => ['Please specify', [], ['text' => true]],
    ],

    'journeys' => [
        'brand_owner' => [
            // Every step takes exactly one option (the engine also supports `multi` steps). A step with
            // `depends_on` shows `options_by[<earlier answer>]`; `derive` builds the list from
            // earlier answers instead (the "Other" category, "relevant priorities only").
            'steps' => [
                [
                    'key' => 'category',
                    'mode' => 'single',
                    'options' => ['beverages', 'meals', 'fried', 'bakery', 'desserts', 'dry_foods', 'cat_other'],
                ],
                [
                    'key' => 'characteristics',
                    'mode' => 'single',
                    'depends_on' => 'category',
                    'options_by' => [
                        'beverages' => ['hot', 'cold', 'liquid', 'semi_liquid'],
                        'meals' => ['hot', 'moist_saucy', 'oily_greasy', 'frozen'],
                        'fried' => ['hot', 'oily_greasy', 'dry_crispy'],
                        'bakery' => ['dry', 'moist', 'oily_greasy', 'fragile'],
                        'desserts' => ['cold', 'frozen', 'moist_semi_liquid'],
                        'dry_foods' => ['dry', 'powdered', 'fragile'],
                        'cat_other' => ['hot', 'cold_frozen', 'liquid_semi_liquid', 'moist_saucy', 'oily_greasy', 'dry_powdered', 'char_other'],
                    ],
                ],
                [
                    'key' => 'applications',
                    'mode' => 'single',
                    'depends_on' => 'category',
                    'options_by' => [
                        'beverages' => ['food_service', 'takeaway', 'delivery', 'retail_distribution'],
                        'meals' => ['dine_in', 'takeaway', 'delivery', 'retail_distribution'],
                        'fried' => ['food_service', 'takeaway', 'delivery', 'retail_distribution', 'wrapping_lining'],
                        'bakery' => ['food_service', 'retail_distribution', 'direct_sale', 'storage_transport'],
                        'desserts' => ['food_service', 'takeaway', 'delivery', 'retail_distribution', 'storage_transport'],
                        'dry_foods' => ['retail_distribution', 'direct_sale', 'storage_transport'],
                        'cat_other' => ['direct_sale', 'retail_distribution', 'storage_transport', 'app_other'],
                    ],
                ],
                [
                    'key' => 'priorities',
                    'mode' => 'single',
                    'depends_on' => 'category',
                    'options_by' => [
                        'beverages' => ['temperature', 'liquid_resistance', 'brand_presentation', 'material_eol'],
                        'meals' => ['temperature', 'liquid_resistance', 'barrier_protection', 'material_eol'],
                        'fried' => ['grease_resistance', 'temperature', 'product_protection', 'material_eol'],
                        'bakery' => ['product_protection', 'brand_presentation', 'material_eol', 'production_process'],
                        'desserts' => ['temperature', 'liquid_resistance', 'product_protection', 'material_eol'],
                        'dry_foods' => ['product_protection', 'brand_presentation', 'distribution', 'material_eol'],
                    ],
                    'derive' => [
                        'for' => ['cat_other'],
                        'base' => ['product_protection', 'brand_presentation', 'material_eol'],
                        'rules' => [
                            'characteristics' => [
                                'hot' => ['temperature'],
                                'cold_frozen' => ['temperature'],
                                'liquid_semi_liquid' => ['liquid_resistance'],
                                'moist_saucy' => ['liquid_resistance', 'barrier_protection'],
                                'oily_greasy' => ['grease_resistance'],
                            ],
                            'applications' => [
                                'direct_sale' => ['distribution'],
                                'storage_transport' => ['distribution'],
                            ],
                        ],
                    ],
                ],
            ],
            'requirements' => ['req_food_safety', 'req_barrier', 'req_printing', 'req_production', 'req_material', 'req_other', 'req_not_sure'],
        ],

        'converter' => [
            'steps' => [
                [
                    'key' => 'applications',
                    'mode' => 'single',
                    'options' => ['conv_flexible', 'conv_wrapping', 'conv_cups', 'conv_bowls', 'conv_containers', 'conv_bags', 'conv_general', 'conv_other'],
                ],
                [
                    'key' => 'processes',
                    'mode' => 'single',
                    'depends_on' => 'applications',
                    'options_by' => [
                        'conv_flexible' => ['proc_lamination', 'proc_coating', 'proc_print_flexo_gravure_offset', 'proc_slitting_rewinding', 'proc_pouch_making'],
                        'conv_wrapping' => ['proc_print_flexo_offset', 'proc_slitting', 'proc_sheeting', 'proc_bag_making', 'proc_wrapper_liner'],
                        'conv_cups' => ['proc_cup_forming', 'proc_blanking_die_cutting', 'proc_print_flexo_offset', 'proc_bottom_sealing', 'proc_rim_curling'],
                        'conv_bowls' => ['proc_bowl_forming', 'proc_blanking_die_cutting', 'proc_print', 'proc_bottom_sealing', 'proc_rim_curling'],
                        'conv_containers' => ['proc_die_cutting', 'proc_folding_gluing', 'proc_print_offset_flexo', 'proc_lamination_if_needed', 'proc_tray_box_forming'],
                        'conv_bags' => ['proc_bag_making_sos', 'proc_print_flexo_offset', 'proc_handle_attachment', 'proc_bottom_gluing', 'proc_reinforcement'],
                        'conv_general' => ['proc_print_offset_flexo', 'proc_die_cutting', 'proc_folding_gluing', 'proc_lamination_optional', 'proc_finishing'],
                        'conv_other' => ['proc_other'],
                    ],
                ],
                [
                    'key' => 'materials',
                    'mode' => 'single',
                    'depends_on' => 'applications',
                    'options_by' => [
                        'conv_flexible' => ['mat_barrier', 'mat_heat_sealability', 'mat_grease_resistance', 'mat_water_resistance', 'mat_printability'],
                        'conv_wrapping' => ['mat_grease_kit', 'mat_oil_moisture', 'mat_printability', 'mat_food_contact', 'mat_natural_pfas_free'],
                        'conv_cups' => ['mat_liquid_resistance', 'mat_heat_hot_drinks', 'mat_cold_resistance', 'mat_stiffness_formability', 'mat_printability'],
                        'conv_bowls' => ['mat_liquid_grease', 'mat_heat_hot_food', 'mat_stiffness_formability', 'mat_printability', 'mat_food_contact'],
                        'conv_containers' => ['mat_grease_resistance', 'mat_liquid_resistance', 'mat_stiffness', 'mat_formability', 'mat_printability'],
                        'conv_bags' => ['mat_strength_tear', 'mat_grease_water', 'mat_printability', 'mat_stiffness', 'mat_food_contact'],
                        'conv_general' => ['mat_stiffness_rigidity', 'mat_printability_high', 'mat_surface_finish', 'mat_folding_performance', 'mat_food_contact_if_required'],
                        'conv_other' => ['mat_other'],
                    ],
                ],
                [
                    'key' => 'machines',
                    'mode' => 'single',
                    'depends_on' => 'applications',
                    'options_by' => [
                        'conv_flexible' => ['mach_lamination_type', 'mach_coating_type', 'mach_printing_method', 'mach_speed', 'mach_web_width'],
                        'conv_wrapping' => ['mach_printing_method', 'mach_sheet_or_reel', 'mach_speed', 'mach_grammage', 'mach_slitting_sheeting'],
                        'conv_cups' => ['mach_cup_size', 'mach_cup_machine', 'mach_speed', 'mach_blank_size', 'mach_grammage'],
                        'conv_bowls' => ['mach_bowl_size', 'mach_machine_type', 'mach_speed', 'mach_blank_size', 'mach_grammage'],
                        'conv_containers' => ['mach_box_size', 'mach_die_cutting_method', 'mach_folding_gluing_line', 'mach_speed', 'mach_grammage'],
                        'conv_bags' => ['mach_bag_type', 'mach_bottom_type', 'mach_handle', 'mach_speed', 'mach_grammage'],
                        'conv_general' => ['mach_printing_method', 'mach_die_folding_line', 'mach_speed', 'mach_surface_finish', 'mach_grammage'],
                        'conv_other' => ['mach_other'],
                    ],
                ],
            ],
            'requirements' => ['req_food_safety', 'req_barrier', 'req_printing', 'req_production', 'req_material', 'req_grade', 'req_other_tech', 'req_not_sure'],
        ],
    ],

    // Priority is rank-weighted: the 1st pick counts 3x, the 2nd 2x, the 3rd 1x.
    'priority_rank_weights' => [3, 2, 1],

    // The optional "specific requirements" step is only asked when the best two products are
    // this close (as a share of the best score), or the visitor picked an "Other" option.
    'ambiguity_margin' => 0.1,
];
