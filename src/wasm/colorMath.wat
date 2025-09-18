;; colorMath.wat - WebAssembly Color Math Acceleration
;; High-performance color space conversions and Delta E calculations

(module
  ;; Import memory from JavaScript
  (import "env" "memory" (memory 1))

  ;; Import basic math functions
  (import "Math" "pow" (func $pow (param f64 f64) (result f64)))
  (import "Math" "sqrt" (func $sqrt (param f64) (result f64)))
  (import "Math" "atan2" (func $atan2 (param f64 f64) (result f64)))
  (import "Math" "cos" (func $cos (param f64) (result f64)))
  (import "Math" "sin" (func $sin (param f64) (result f64)))
  (import "Math" "exp" (func $exp (param f64) (result f64)))

  ;; Constants for color space conversions
  (global $GAMMA_THRESHOLD (f64.const 0.04045))
  (global $GAMMA_A (f64.const 0.055))
  (global $GAMMA_B (f64.const 1.055))
  (global $GAMMA_POWER (f64.const 2.4))
  (global $GAMMA_LINEAR (f64.const 12.92))

  ;; sRGB to XYZ matrix constants
  (global $SRGB_TO_XYZ_00 (f64.const 0.4124564))
  (global $SRGB_TO_XYZ_01 (f64.const 0.3575761))
  (global $SRGB_TO_XYZ_02 (f64.const 0.1804375))
  (global $SRGB_TO_XYZ_10 (f64.const 0.2126729))
  (global $SRGB_TO_XYZ_11 (f64.const 0.7151522))
  (global $SRGB_TO_XYZ_12 (f64.const 0.0721750))
  (global $SRGB_TO_XYZ_20 (f64.const 0.0193339))
  (global $SRGB_TO_XYZ_21 (f64.const 0.1191920))
  (global $SRGB_TO_XYZ_22 (f64.const 0.9503041))

  ;; D65 illuminant constants
  (global $D65_X (f64.const 95.047))
  (global $D65_Y (f64.const 100.000))
  (global $D65_Z (f64.const 108.883))

  ;; LAB conversion constants
  (global $LAB_EPSILON (f64.const 0.008856))
  (global $LAB_KAPPA (f64.const 7.787))
  (global $LAB_DELTA (f64.const 0.137931034)) ;; 16/116

  ;; CIEDE2000 constants
  (global $POW_25_7 (f64.const 6103515625.0)) ;; 25^7

  ;; Apply gamma correction for sRGB to linear conversion
  (func $apply_gamma_correction (param $channel f64) (result f64)
    (local $result f64)

    (if (result f64)
      (f64.gt (local.get $channel) (global.get $GAMMA_THRESHOLD))
      (then
        ;; ((channel + 0.055) / 1.055)^2.4
        (local.set $result
          (f64.div
            (f64.add (local.get $channel) (global.get $GAMMA_A))
            (global.get $GAMMA_B)))
        (call $pow (local.get $result) (global.get $GAMMA_POWER))
      )
      (else
        ;; channel / 12.92
        (f64.div (local.get $channel) (global.get $GAMMA_LINEAR))
      )
    )
  )

  ;; Convert RGB to XYZ color space
  ;; Memory layout: [r, g, b] -> [x, y, z]
  (func $rgb_to_xyz (param $rgb_ptr i32) (param $xyz_ptr i32)
    (local $r f64) (local $g f64) (local $b f64)
    (local $r_linear f64) (local $g_linear f64) (local $b_linear f64)
    (local $x f64) (local $y f64) (local $z f64)

    ;; Load RGB values and normalize (0-255 -> 0-1)
    (local.set $r (f64.div (f64.load (local.get $rgb_ptr)) (f64.const 255.0)))
    (local.set $g (f64.div (f64.load offset=8 (local.get $rgb_ptr)) (f64.const 255.0)))
    (local.set $b (f64.div (f64.load offset=16 (local.get $rgb_ptr)) (f64.const 255.0)))

    ;; Apply gamma correction
    (local.set $r_linear (call $apply_gamma_correction (local.get $r)))
    (local.set $g_linear (call $apply_gamma_correction (local.get $g)))
    (local.set $b_linear (call $apply_gamma_correction (local.get $b)))

    ;; Matrix multiplication: sRGB to XYZ
    ;; X = 0.4124564*R + 0.3575761*G + 0.1804375*B
    (local.set $x
      (f64.add
        (f64.add
          (f64.mul (local.get $r_linear) (global.get $SRGB_TO_XYZ_00))
          (f64.mul (local.get $g_linear) (global.get $SRGB_TO_XYZ_01)))
        (f64.mul (local.get $b_linear) (global.get $SRGB_TO_XYZ_02))))

    ;; Y = 0.2126729*R + 0.7151522*G + 0.0721750*B
    (local.set $y
      (f64.add
        (f64.add
          (f64.mul (local.get $r_linear) (global.get $SRGB_TO_XYZ_10))
          (f64.mul (local.get $g_linear) (global.get $SRGB_TO_XYZ_11)))
        (f64.mul (local.get $b_linear) (global.get $SRGB_TO_XYZ_12))))

    ;; Z = 0.0193339*R + 0.1191920*G + 0.9503041*B
    (local.set $z
      (f64.add
        (f64.add
          (f64.mul (local.get $r_linear) (global.get $SRGB_TO_XYZ_20))
          (f64.mul (local.get $g_linear) (global.get $SRGB_TO_XYZ_21)))
        (f64.mul (local.get $b_linear) (global.get $SRGB_TO_XYZ_22))))

    ;; Scale by 100 and store results
    (f64.store (local.get $xyz_ptr) (f64.mul (local.get $x) (f64.const 100.0)))
    (f64.store offset=8 (local.get $xyz_ptr) (f64.mul (local.get $y) (f64.const 100.0)))
    (f64.store offset=16 (local.get $xyz_ptr) (f64.mul (local.get $z) (f64.const 100.0)))
  )

  ;; LAB transformation function: f(t) = t^(1/3) if t > epsilon, else (kappa*t + 16/116)
  (func $lab_transform (param $t f64) (result f64)
    (if (result f64)
      (f64.gt (local.get $t) (global.get $LAB_EPSILON))
      (then
        (call $pow (local.get $t) (f64.const 0.33333333333))
      )
      (else
        (f64.add
          (f64.mul (global.get $LAB_KAPPA) (local.get $t))
          (global.get $LAB_DELTA))
      )
    )
  )

  ;; Convert XYZ to LAB color space
  ;; Memory layout: [x, y, z] -> [l, a, b]
  (func $xyz_to_lab (param $xyz_ptr i32) (param $lab_ptr i32)
    (local $x f64) (local $y f64) (local $z f64)
    (local $xr f64) (local $yr f64) (local $zr f64)
    (local $fx f64) (local $fy f64) (local $fz f64)
    (local $l f64) (local $a f64) (local $b f64)

    ;; Load XYZ values
    (local.set $x (f64.load (local.get $xyz_ptr)))
    (local.set $y (f64.load offset=8 (local.get $xyz_ptr)))
    (local.set $z (f64.load offset=16 (local.get $xyz_ptr)))

    ;; Normalize by D65 illuminant
    (local.set $xr (f64.div (local.get $x) (global.get $D65_X)))
    (local.set $yr (f64.div (local.get $y) (global.get $D65_Y)))
    (local.set $zr (f64.div (local.get $z) (global.get $D65_Z)))

    ;; Apply LAB transformation
    (local.set $fx (call $lab_transform (local.get $xr)))
    (local.set $fy (call $lab_transform (local.get $yr)))
    (local.set $fz (call $lab_transform (local.get $zr)))

    ;; Calculate L, a, b
    (local.set $l (f64.sub (f64.mul (f64.const 116.0) (local.get $fy)) (f64.const 16.0)))
    (local.set $a (f64.mul (f64.const 500.0) (f64.sub (local.get $fx) (local.get $fy))))
    (local.set $b (f64.mul (f64.const 200.0) (f64.sub (local.get $fy) (local.get $fz))))

    ;; Store results
    (f64.store (local.get $lab_ptr) (local.get $l))
    (f64.store offset=8 (local.get $lab_ptr) (local.get $a))
    (f64.store offset=16 (local.get $lab_ptr) (local.get $b))
  )

  ;; Direct RGB to LAB conversion (combined function for efficiency)
  ;; Memory layout: [r, g, b] -> [l, a, b]
  (func $rgb_to_lab (export "rgb_to_lab") (param $rgb_ptr i32) (param $lab_ptr i32)
    (local $xyz_buffer i32)

    ;; Allocate temporary XYZ buffer (24 bytes)
    (local.set $xyz_buffer (i32.const 1024))

    ;; Convert RGB -> XYZ -> LAB
    (call $rgb_to_xyz (local.get $rgb_ptr) (local.get $xyz_buffer))
    (call $xyz_to_lab (local.get $xyz_buffer) (local.get $lab_ptr))
  )

  ;; Calculate CIE76 Delta E
  ;; Memory layout: [l1, a1, b1, l2, a2, b2] -> distance
  (func $delta_e_cie76 (export "delta_e_cie76") (param $lab1_ptr i32) (param $lab2_ptr i32) (result f64)
    (local $dl f64) (local $da f64) (local $db f64)

    ;; Calculate differences
    (local.set $dl (f64.sub (f64.load (local.get $lab1_ptr)) (f64.load (local.get $lab2_ptr))))
    (local.set $da (f64.sub (f64.load offset=8 (local.get $lab1_ptr)) (f64.load offset=8 (local.get $lab2_ptr))))
    (local.set $db (f64.sub (f64.load offset=16 (local.get $lab1_ptr)) (f64.load offset=16 (local.get $lab2_ptr))))

    ;; Calculate Euclidean distance
    (call $sqrt
      (f64.add
        (f64.add
          (f64.mul (local.get $dl) (local.get $dl))
          (f64.mul (local.get $da) (local.get $da)))
        (f64.mul (local.get $db) (local.get $db))))
  )

  ;; Calculate CIE94 Delta E
  ;; Memory layout: [l1, a1, b1, l2, a2, b2] -> distance
  (func $delta_e_cie94 (export "delta_e_cie94") (param $lab1_ptr i32) (param $lab2_ptr i32) (result f64)
    (local $l1 f64) (local $a1 f64) (local $b1 f64)
    (local $l2 f64) (local $a2 f64) (local $b2 f64)
    (local $dl f64) (local $da f64) (local $db f64)
    (local $c1 f64) (local $c2 f64) (local $dc f64) (local $dh f64)
    (local $sl f64) (local $sc f64) (local $sh f64)
    (local $kL f64) (local $kC f64) (local $kH f64)
    (local $k1 f64) (local $k2 f64)
    (local $term1 f64) (local $term2 f64) (local $term3 f64)

    ;; Load LAB values
    (local.set $l1 (f64.load (local.get $lab1_ptr)))
    (local.set $a1 (f64.load offset=8 (local.get $lab1_ptr)))
    (local.set $b1 (f64.load offset=16 (local.get $lab1_ptr)))
    (local.set $l2 (f64.load (local.get $lab2_ptr)))
    (local.set $a2 (f64.load offset=8 (local.get $lab2_ptr)))
    (local.set $b2 (f64.load offset=16 (local.get $lab2_ptr)))

    ;; CIE94 constants
    (local.set $kL (f64.const 1.0))
    (local.set $kC (f64.const 1.0))
    (local.set $kH (f64.const 1.0))
    (local.set $k1 (f64.const 0.045))
    (local.set $k2 (f64.const 0.015))

    ;; Calculate differences
    (local.set $dl (f64.sub (local.get $l1) (local.get $l2)))
    (local.set $da (f64.sub (local.get $a1) (local.get $a2)))
    (local.set $db (f64.sub (local.get $b1) (local.get $b2)))

    ;; Calculate chroma values
    (local.set $c1 (call $sqrt (f64.add (f64.mul (local.get $a1) (local.get $a1))
                                        (f64.mul (local.get $b1) (local.get $b1)))))
    (local.set $c2 (call $sqrt (f64.add (f64.mul (local.get $a2) (local.get $a2))
                                        (f64.mul (local.get $b2) (local.get $b2)))))
    (local.set $dc (f64.sub (local.get $c1) (local.get $c2)))

    ;; Calculate Delta H
    (local.set $dh
      (call $sqrt
        (f64.sub
          (f64.add (f64.mul (local.get $da) (local.get $da))
                   (f64.mul (local.get $db) (local.get $db)))
          (f64.mul (local.get $dc) (local.get $dc)))))

    ;; Weighting functions
    (local.set $sl (f64.const 1.0))
    (local.set $sc (f64.add (f64.const 1.0) (f64.mul (local.get $k1) (local.get $c1))))
    (local.set $sh (f64.add (f64.const 1.0) (f64.mul (local.get $k2) (local.get $c1))))

    ;; Calculate terms
    (local.set $term1 (f64.div (local.get $dl) (f64.mul (local.get $kL) (local.get $sl))))
    (local.set $term2 (f64.div (local.get $dc) (f64.mul (local.get $kC) (local.get $sc))))
    (local.set $term3 (f64.div (local.get $dh) (f64.mul (local.get $kH) (local.get $sh))))

    ;; Final result
    (call $sqrt
      (f64.add
        (f64.add
          (f64.mul (local.get $term1) (local.get $term1))
          (f64.mul (local.get $term2) (local.get $term2)))
        (f64.mul (local.get $term3) (local.get $term3))))
  )

  ;; Batch RGB to LAB conversion
  ;; Memory layout: input [r1,g1,b1,r2,g2,b2,...], output [l1,a1,b1,l2,a2,b2,...]
  (func $batch_rgb_to_lab (export "batch_rgb_to_lab") (param $rgb_ptr i32) (param $lab_ptr i32) (param $count i32)
    (local $i i32)
    (local $rgb_offset i32)
    (local $lab_offset i32)

    (local.set $i (i32.const 0))

    (loop $convert_loop
      ;; Calculate memory offsets (24 bytes per color)
      (local.set $rgb_offset (i32.add (local.get $rgb_ptr) (i32.mul (local.get $i) (i32.const 24))))
      (local.set $lab_offset (i32.add (local.get $lab_ptr) (i32.mul (local.get $i) (i32.const 24))))

      ;; Convert current color
      (call $rgb_to_lab (local.get $rgb_offset) (local.get $lab_offset))

      ;; Increment counter
      (local.set $i (i32.add (local.get $i) (i32.const 1)))

      ;; Continue loop if not done
      (br_if $convert_loop (i32.lt_u (local.get $i) (local.get $count)))
    )
  )

  ;; Batch Delta E calculation for distance matrix
  ;; Memory layout: colors [l1,a1,b1,l2,a2,b2,...], distances [d1,d2,d3,...]
  (func $batch_delta_e_matrix (export "batch_delta_e_matrix")
    (param $lab_ptr i32) (param $count i32) (param $distances_ptr i32)
    (local $i i32) (local $j i32)
    (local $lab1_offset i32) (local $lab2_offset i32)
    (local $distance_offset i32)
    (local $distance f64)

    (local.set $i (i32.const 0))

    (loop $outer_loop
      (local.set $j (i32.const 0))

      (loop $inner_loop
        ;; Calculate memory offsets
        (local.set $lab1_offset (i32.add (local.get $lab_ptr) (i32.mul (local.get $i) (i32.const 24))))
        (local.set $lab2_offset (i32.add (local.get $lab_ptr) (i32.mul (local.get $j) (i32.const 24))))
        (local.set $distance_offset
          (i32.add (local.get $distances_ptr)
            (i32.mul (i32.add (i32.mul (local.get $i) (local.get $count)) (local.get $j))
                     (i32.const 8))))

        ;; Calculate distance (skip diagonal for efficiency)
        (if (i32.eq (local.get $i) (local.get $j))
          (then
            (local.set $distance (f64.const 0.0))
          )
          (else
            (local.set $distance (call $delta_e_cie76 (local.get $lab1_offset) (local.get $lab2_offset)))
          )
        )

        ;; Store distance
        (f64.store (local.get $distance_offset) (local.get $distance))

        ;; Increment inner counter
        (local.set $j (i32.add (local.get $j) (i32.const 1)))
        (br_if $inner_loop (i32.lt_u (local.get $j) (local.get $count)))
      )

      ;; Increment outer counter
      (local.set $i (i32.add (local.get $i) (i32.const 1)))
      (br_if $outer_loop (i32.lt_u (local.get $i) (local.get $count)))
    )
  )

  ;; Find nearest color using linear search
  ;; Returns index of nearest color
  (func $find_nearest_color (export "find_nearest_color")
    (param $target_lab_ptr i32) (param $candidates_ptr i32) (param $count i32) (result i32)
    (local $i i32)
    (local $best_index i32)
    (local $best_distance f64)
    (local $current_distance f64)
    (local $candidate_offset i32)

    (local.set $i (i32.const 0))
    (local.set $best_index (i32.const 0))
    (local.set $best_distance (f64.const 1000.0)) ;; Large initial value

    (loop $search_loop
      ;; Calculate candidate offset
      (local.set $candidate_offset (i32.add (local.get $candidates_ptr) (i32.mul (local.get $i) (i32.const 24))))

      ;; Calculate distance to current candidate
      (local.set $current_distance (call $delta_e_cie76 (local.get $target_lab_ptr) (local.get $candidate_offset)))

      ;; Update best if current is better
      (if (f64.lt (local.get $current_distance) (local.get $best_distance))
        (then
          (local.set $best_distance (local.get $current_distance))
          (local.set $best_index (local.get $i))
        )
      )

      ;; Increment counter
      (local.set $i (i32.add (local.get $i) (i32.const 1)))
      (br_if $search_loop (i32.lt_u (local.get $i) (local.get $count)))
    )

    (local.get $best_index)
  )
)