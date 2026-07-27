jQuery(document).ready(function($) {
    'use strict';
    
    // 각 폼에 대해 초기화
    $('.jkwf-form').each(function() {
        initForm($(this));
    });
    
    // 가로형 스킨 강제 적용
    $('.jkwf-skin-horizontal').each(function() {
        enforceHorizontalLayout($(this));
    });
    
    function enforceHorizontalLayout($form) {
        // CSS가 제대로 적용되지 않는 경우를 위한 JavaScript 처리
        const $row = $form.find('.jkwf-horizontal-row');
        if ($row.length > 0) {
            // 인라인 스타일 강제 적용
            $row.css({
                'display': 'flex',
                'gap': '5px',
                'align-items': 'flex-end',
                'width': '100%'
            });
            
            $row.find('.jkwf-form-fields-wrap').css({
                'flex': '1',
                'display': 'flex',
                'gap': '5px',
                'align-items': 'flex-end'
            });
            
            $row.find('.jkwf-field').css({
                'flex': '1',
                'min-width': '0',
                'margin-bottom': '0'
            });
            
            $row.find('.jkwf-submit-wrap').css({
                'margin-top': '0',
                'flex-shrink': '0'
            });
        }
    }
    
    function initForm($form) {
        // 현재 페이지 주소 자동 입력
        $form.find('input[name="inquiry_page"]').val(window.location.href);
        
        // 전화번호 필드 자동 포맷팅
        $form.find('input[type="tel"]').each(function() {
            initPhoneFormat($(this));
        });
        
        // 폼 전송
        $form.on('submit', function(e) {
            e.preventDefault();
            
            const $currentForm = $(this);
            let isValid = true;
            let errorMessages = [];
            
            // 기존 에러 스타일 제거
            $currentForm.find('.jkwf-field').removeClass('jkwf-error');
            $currentForm.find('.jkwf-error-message').remove();
            
            // 1) 텍스트, 이메일, 전화번호 등 일반 필드 검증
            $currentForm.find('input[required], textarea[required], select[required]').each(function() {
                const $field = $(this);
                const fieldType = $field.attr('type');
                const value = $field.val().trim();
                
                if (!value) {
                    const $fieldWrap = $field.closest('.jkwf-field');
                    const labelText = $fieldWrap.find('label').first().text().replace('*', '').trim();
                    
                    $fieldWrap.addClass('jkwf-error');
                    errorMessages.push(labelText);
                    isValid = false;
                } else {
                    // 이메일 형식 검증
                    if (fieldType === 'email' && !isValidEmail(value)) {
                        const $fieldWrap = $field.closest('.jkwf-field');
                        const labelText = $fieldWrap.find('label').first().text().replace('*', '').trim();
                        
                        $fieldWrap.addClass('jkwf-error');
                        $fieldWrap.append('<span class="jkwf-error-message">올바른 이메일 형식이 아닙니다.</span>');
                        isValid = false;
                    }
                    
                    // 전화번호 형식 검증 (선택적)
                    if (fieldType === 'tel' && !isValidPhone(value)) {
                        const $fieldWrap = $field.closest('.jkwf-field');
                        const labelText = $fieldWrap.find('label').first().text().replace('*', '').trim();
                        
                        $fieldWrap.addClass('jkwf-error');
                        $fieldWrap.append('<span class="jkwf-error-message">올바른 휴대폰 번호 형식이 아닙니다. (예: 010-1234-5678)</span>');
                        isValid = false;
                    }
                }
            });
            
            // 2) 라디오 그룹 검증
            $currentForm.find('.jkwf-radio-group').each(function() {
                const $group = $(this);
                const $firstRadio = $group.find('input[type="radio"]').first();
                
                if ($firstRadio.prop('required')) {
                    const isChecked = $group.find('input[type="radio"]:checked').length > 0;
                    
                    if (!isChecked) {
                        const $fieldWrap = $group.closest('.jkwf-field');
                        const labelText = $fieldWrap.find('.jkwf-field-label').text().replace('*', '').trim();
                        
                        $fieldWrap.addClass('jkwf-error');
                        errorMessages.push(labelText);
                        isValid = false;
                    }
                }
            });
            
            // 3) 체크박스 그룹 검증
            $currentForm.find('.jkwf-checkbox-group').each(function() {
                const $group = $(this);
                const isRequired = $group.find('input[type="checkbox"][data-required="true"]').length > 0;
                
                if (isRequired) {
                    const isChecked = $group.find('input[type="checkbox"]:checked').length > 0;
                    
                    if (!isChecked) {
                        const $fieldWrap = $group.closest('.jkwf-field');
                        const labelText = $fieldWrap.find('.jkwf-field-label').text().replace('*', '').trim();
                        
                        $fieldWrap.addClass('jkwf-error');
                        errorMessages.push(labelText + ' 중 최소 1개를 선택해주세요');
                        isValid = false;
                    }
                }
            });
            
            // 에러 메시지 표시
            if (!isValid) {
                if (errorMessages.length > 0) {
                    let message = '';
                    if (errorMessages.length === 1) {
                        message = `"${errorMessages[0]}"은(는) 필수 입력입니다.`;
                    } else {
                        message = `"${errorMessages.join('", "')}"은(는) 필수 입력입니다.`;
                    }
                    alert(message);
                }
                
                // 첫 번째 에러 필드로 스크롤
                const $firstError = $currentForm.find('.jkwf-field.jkwf-error').first();
                if ($firstError.length) {
                    $('html, body').animate({
                        scrollTop: $firstError.offset().top - 100
                    }, 500);
                }
                
                return false;
            }
            
            // 폼 데이터 생성
            const formData = new FormData($currentForm[0]);
            
            // Ajax 전송
            $.ajax({
                url: jkwf_ajax_obj.ajax_url,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                beforeSend: function() {
                    $currentForm.addClass('jkwf-loading');
                    $currentForm.find('button[type="submit"]').prop('disabled', true);
                },
                success: function(res) {
                    if (res.success) {
                        // 성공 메시지
                        alert(res.data);
                        
                        // 폼 초기화
                        $currentForm[0].reset();
                        
                        // 성공 후 처리 (필요시 리디렉션 등)
                        if ($currentForm.data('success-url')) {
                            window.location.href = $currentForm.data('success-url');
                        }
                    } else {
                        alert('오류: ' + res.data);
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Ajax 오류:', error);
                    alert('서버와 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
                },
                complete: function() {
                    $currentForm.removeClass('jkwf-loading');
                    $currentForm.find('button[type="submit"]').prop('disabled', false);
                }
            });
        });
        
        // 실시간 유효성 검사 (선택적)
        $form.find('input[required], textarea[required]').on('blur', function() {
            const $field = $(this);
            const $fieldWrap = $field.closest('.jkwf-field');
            
            if (!$field.val().trim()) {
                $fieldWrap.addClass('jkwf-error');
            } else {
                $fieldWrap.removeClass('jkwf-error');
            }
        });
    }


    // 전화번호 자동 포맷팅
    function initPhoneFormat($input) {
        // 초기값이 있으면 포맷팅 적용
        if ($input.val()) {
            let value = $input.val().replace(/[^0-9]/g, '');
            
            if (value.startsWith('01')) {
                if (value.length > 3 && value.length <= 7) {
                    value = value.slice(0, 3) + '-' + value.slice(3);
                } else if (value.length > 7) {
                    value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
                }
            } else if (value.startsWith('02')) {
                if (value.length > 2 && value.length <= 6) {
                    value = value.slice(0, 2) + '-' + value.slice(2);
                } else if (value.length > 6) {
                    value = value.slice(0, 2) + '-' + value.slice(2, 6) + '-' + value.slice(6, 10);
                }
            } else if (value.startsWith('0')) {
                if (value.length > 3 && value.length <= 7) {
                    value = value.slice(0, 3) + '-' + value.slice(3);
                } else if (value.length > 7) {
                    value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
                }
            }
            
            $input.val(value);
            $input.data('prevValue', value);
        }
        
        $input.on('input', function(e) {
            let value = $(this).val();
            let cursorPos = this.selectionStart;
            
            // 이전 값 저장
            let prevValue = $(this).data('prevValue') || '';
            
            // 숫자만 추출
            value = value.replace(/[^0-9]/g, '');
            
            // 백스페이스로 하이픈을 지웠는지 확인
            let isDeleting = prevValue.length > $(this).val().length;
            
            // 포맷팅 (휴대폰 번호 기준)
            if (value.length > 0) {
                // 010, 011, 016, 017, 018, 019로 시작하는 휴대폰 번호
                if (value.startsWith('01')) {
                    if (value.length > 3 && value.length <= 7) {
                        value = value.slice(0, 3) + '-' + value.slice(3);
                    } else if (value.length > 7) {
                        value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
                    }
                }
                // 02 서울 지역번호
                else if (value.startsWith('02')) {
                    if (value.length > 2 && value.length <= 6) {
                        value = value.slice(0, 2) + '-' + value.slice(2);
                    } else if (value.length > 6) {
                        value = value.slice(0, 2) + '-' + value.slice(2, 6) + '-' + value.slice(6, 10);
                    }
                }
                // 기타 지역번호 (031, 032, 033 등)
                else if (value.startsWith('0')) {
                    if (value.length > 3 && value.length <= 7) {
                        value = value.slice(0, 3) + '-' + value.slice(3);
                    } else if (value.length > 7) {
                        value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
                    }
                }
            }
            
            // 값 설정
            $(this).val(value);
            $(this).data('prevValue', value);
            
            // 커서 위치 조정
            if (!isDeleting) {
                if (value.startsWith('02') && (cursorPos === 3 || cursorPos === 8)) {
                    cursorPos++;
                } else if ((cursorPos === 4 || cursorPos === 9)) {
                    cursorPos++;
                }
            }
            this.setSelectionRange(cursorPos, cursorPos);
        });
        
        // 숫자가 아닌 문자 입력 방지
        $input.on('keypress', function(e) {
            // 백스페이스, 탭, 엔터, 화살표 키 등은 허용
            if (e.which === 8 || e.which === 9 || e.which === 13 || 
                e.which === 37 || e.which === 38 || e.which === 39 || e.which === 40) {
                return true;
            }
            
            // 숫자만 허용 (0-9)
            if (e.which < 48 || e.which > 57) {
                e.preventDefault();
                return false;
            }
        });
        
        // 붙여넣기 시에도 포맷팅
        $input.on('paste', function(e) {
            e.preventDefault();
            let pastedData = (e.originalEvent || e).clipboardData.getData('text/plain');
            let numbersOnly = pastedData.replace(/[^0-9]/g, '');
            
            // 포맷팅 적용
            if (numbersOnly.startsWith('01')) {
                if (numbersOnly.length > 3 && numbersOnly.length <= 7) {
                    numbersOnly = numbersOnly.slice(0, 3) + '-' + numbersOnly.slice(3);
                } else if (numbersOnly.length > 7) {
                    numbersOnly = numbersOnly.slice(0, 3) + '-' + numbersOnly.slice(3, 7) + '-' + numbersOnly.slice(7, 11);
                }
            } else if (numbersOnly.startsWith('02')) {
                if (numbersOnly.length > 2 && numbersOnly.length <= 6) {
                    numbersOnly = numbersOnly.slice(0, 2) + '-' + numbersOnly.slice(2);
                } else if (numbersOnly.length > 6) {
                    numbersOnly = numbersOnly.slice(0, 2) + '-' + numbersOnly.slice(2, 6) + '-' + numbersOnly.slice(6, 10);
                }
            } else if (numbersOnly.startsWith('0')) {
                if (numbersOnly.length > 3 && numbersOnly.length <= 7) {
                    numbersOnly = numbersOnly.slice(0, 3) + '-' + numbersOnly.slice(3);
                } else if (numbersOnly.length > 7) {
                    numbersOnly = numbersOnly.slice(0, 3) + '-' + numbersOnly.slice(3, 7) + '-' + numbersOnly.slice(7, 11);
                }
            }
            
            $(this).val(numbersOnly);
            $(this).data('prevValue', numbersOnly);
        });
    }
    
    // 이메일 유효성 검사
    function isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
// 전화번호 유효성 검사 (한국 전화번호)
function isValidPhone(phone) {
    // 휴대폰 번호 (010, 011, 016, 017, 018, 019)
    const mobileRegex = /^(01[016789])-?([0-9]{3,4})-?([0-9]{4})$/;
    // 서울 지역번호
    const seoulRegex = /^(02)-?([0-9]{3,4})-?([0-9]{4})$/;
    // 기타 지역번호
    const localRegex = /^(0[3-9][0-9])-?([0-9]{3,4})-?([0-9]{4})$/;
    
    return mobileRegex.test(phone) || seoulRegex.test(phone) || localRegex.test(phone);
}

    // 파일 업로드 미리보기 (선택적)
    $('input[type="file"]').on('change', function() {
        const $input = $(this);
        const files = this.files;
        
        if (files && files[0]) {
            const fileName = files[0].name;
            const fileSize = (files[0].size / 1024 / 1024).toFixed(2); // MB
            
            // 파일 정보 표시 (필요시 구현)
            console.log(`선택된 파일: ${fileName} (${fileSize}MB)`);
        }
    });
});