import React from 'react';
import PropTypes from 'prop-types';
import anime from 'animejs';
import Input from 'components/form/input';
import {injectIntl} from 'react-intl';
import cloneDeep from 'clone-deep';
import fuzzysearch from 'fuzzysearch';
import cn from 'classnames';

import css from './navBar.module.scss';

class NavBar extends React.Component {
    constructor() {
        super();
    }

    attentionTimeoutId = 0;
    attention$el = false;

    state = {
        sections: [],
        filteredSections: [],
        searchQuery: '',
        activeParam: ''
    }

    static propTypes = {
        sectionSelector: PropTypes.string,
        sectionTitleSelector: PropTypes.string,
        paramNameSelector: PropTypes.string,
        paramSelector: PropTypes.string,
    }

    componentDidMount() {
        this.setState({
            sections: this.calculatesSection()
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        let filteredSections = [];
        let {searchQuery} = this.state;

        if (prevState.searchQuery !== searchQuery) {
            this.setState({
                filteredSections: this.getFilteredSections()
            })
        }
    }

    getFilteredSections() {
        let sections = cloneDeep(this.state.sections);
        let {searchQuery} = this.state;

        return sections.map(s => {
            s.params = s.params.filter(param => {
                return fuzzysearch(searchQuery.toLowerCase(), param.content.toLowerCase())
            })

            return s;
        })
    }

    calculatesSection() {
        let $sections = document.querySelectorAll(this.props.sectionSelector);

        return Array.from($sections).map($section => {
            let $title = $section.querySelector(this.props.sectionTitleSelector);

            if (!$title) return false;

            return {
                $section: $section,
                $title,
                title: $title.innerText,
                params: this.getParamList($section)
            }
        }).filter(el => el);
    }

    getParamList($section){
        let params = $section.querySelectorAll(this.props.paramSelector);

        return Array.from(params).map($param => {
            let $paramName = $param.querySelector(this.props.paramNameSelector);

            return {
                content: $paramName.innerText,
                visible: true,
                $param,
                $paramName
            }
        })
    }
    
    scrollTo = ($el) => {
        anime({
            targets: ['html', 'body'],
            scrollTop: $el.offsetTop - 16,
            duration: 600,
            easing: 'easeInOutCubic',
            complete: () => {
                this.attractAttention($el);
            }
        })
    }

    attractAttention($el) {
        let {activeClass} = this.props;

        if (this.attention$el) {
            this.attention$el.classList.remove(activeClass)
        }

        this.attention$el = $el;

        $el.classList.add(activeClass);

        this.attentionTimeoutId = setTimeout(() => {
            $el.classList.remove(activeClass);
        }, 3000)
    }

    onClickParam = (param) => (e) => {
        e.preventDefault();
        this.scrollTo(param.$param);
    }

    onClickTitle = (title) => (e) => {
        e.preventDefault();
        this.scrollTo(title.$title);
    }

    onChangeSearch = (e) => {
        this.setState({
            searchQuery: e.target.value
        })
    }

    render() {
        let {sections, searchQuery, filteredSections, searchIsFocused} = this.state;
        let {intl: {messages}} = this.props;
        return (
            <aside className={css.el}>
                <Input
                    className={css.searchInput}
                    onChange={this.onChangeSearch}
                    onFocus={this.onFocusSearch}
                    onBlur={this.onBlurSearch}
                    placeholder={messages.searchPlaceholder}
                    value={searchQuery}
                />
                {(searchQuery ? filteredSections : sections).map((titleObj) => {
                    let {title, params} = titleObj;
                    return <div key={title} className={css.section}>
                        <a
                            href={'#'}
                            className={css.sectionTitle}
                            onClick={this.onClickTitle(titleObj)}
                        >
                            {title}
                        </a>
                        <div className={css.sectionParams}>
                            {searchQuery && params.length === 0 && <div className={css.notFound}>
                                {messages.notFound}
                            </div>}
                            {params.map((param) => {
                                return <div className={css.sectionParam} key={`${title}${param.content}`}>
                                    <a
                                        className={css.sectionParamLink}
                                        href='#'
                                        onClick={this.onClickParam(param)}
                                    >
                                        {param.content}
                                    </a>
                                </div>
                            })}
                        </div>
                    </div>
                })}
            </aside>
        );
    }
}

export default injectIntl(NavBar);
