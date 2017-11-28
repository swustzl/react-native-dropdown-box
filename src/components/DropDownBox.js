import React, {Component} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    Dimensions,
    StyleSheet,
    TextInput,
} from 'react-native';
import PropTypes from 'prop-types';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default class DropDownBox extends Component {
    static propTypes = {

        /**
         * 控制下拉框的按钮是否可点击使用
         * true 按钮不可使用； false 按钮可使用
         * 默认false
         * */
        disabled: PropTypes.bool,

        /**
         * 控制是否显示搜索框
         * true 显示； false 不显示
         * 默认不显示
         * */
        enabledSearch: PropTypes.bool,

        /**
         * 指定控制list位于button的方位
         * 可选值：default,bottom,right,top,left
         * 默认default
         * */
        listShowOrientation: PropTypes.string,

        /**
         * 默认指定显示数据的index，不指定时，默认为0
         * */
        defaultIndex: PropTypes.number,

        /**
         * 数据列
         * 数据中应包含 label，value； value 不可重复
         * 示例：
         * [{id:1,value:"a",label:"测试一"},{id:2,value:"b",label:"测试二"}]
         * */
        data: PropTypes.array,

        /**
         * 自定义绘制item， 该方法参数为对象，其中包含item：该列的数据；index：当前列的index；selectedIndex：当前选中的index
         * 当实现该方法时，请自行根据 index==selectedIndex 定义 当前选中行要显示的style
         * */
        renderItem: PropTypes.func,

        /**
         * 自定义绘制button，该方法参数为item
         * */
        renderButton: PropTypes.func,

        /**
         * 回调函数，返回选中的item*/
        onSelectCallBack: PropTypes.func,

        /**
         * 下拉列表的style，指定下拉列表的宽高，优先级最高
         * 当list的宽度大于要显示界面剩余宽度时，使用界面剩余宽度
         * 当list的高度大于要显示界面剩余高度时，使用界面剩余高度
         * */
        dropDownListStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object, PropTypes.array]),

        /**
         * 按钮的style，指定按钮的宽高，且当dropDownListStyle不指定宽度时，优先以按钮的宽度
         * 当list的宽度大于要显示界面剩余宽度时，使用界面剩余宽度
         * */
        dropDownButtonStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object, PropTypes.array]),

        /**
         * item的style，指定item的宽高，且当dropDownListStyle不指定高度时，优先以item的高度*item的数量作为list的高度
         * 当list的高度大于要显示界面剩余高度时，使用界面剩余高度
         * */
        dropDownItemStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object, PropTypes.array]),//item的style，指定item的宽高
    }

    constructor(props) {
        super(props);
        console.log("======");
        console.log(props);
        this._button = null;
        this._buttonFrame = null;
        this._searchInput = null;
        this._finalData = this._handleData(props.data);

        let defaultIndex = props.defaultIndex ? props.defaultIndex : 0;
        this.state = {
            modalVisible: false,
            data: this._finalData,
            selectedIndex: defaultIndex,
            selectedValue: props.data[defaultIndex].value,
            selectedLabel: props.data[defaultIndex].label,
            selectedItem: props.data[defaultIndex],
            initialScrollIndex: defaultIndex,
        };
    }

    _handleData = (data) => {
        let returnData = [];
        data.map((item, index) => {
            item._index = index;
            returnData[index] = item;
        });
        return returnData;
    };

    /*componentWillReceiveProps(nextProps) {
        console.log(nextProps);
    }*/

    _updatePosition = (callback) => {
        if (this._button && this._button.measure) {
            this._button.measure((fx, fy, width, height, px, py) => {
                let bottomSpace = windowHeight - py - height;
                let rightSpace = windowWidth - px - width;
                this._buttonFrame = {
                    topSpace: py,
                    leftSpace: px,
                    bottomSpace: bottomSpace,
                    rightSpace: rightSpace,
                    w: width,
                    h: height,
                };
                callback && callback();
            });
        }
    };

    show() {
        this._updatePosition(() => {
            let selectedIndex = this.state.selectedItem._index;
            this.setState({
                modalVisible: true,
                selectedIndex: selectedIndex,
                initialScrollIndex: selectedIndex,
                data: this._finalData,
            });
        });
    }

    _onButtonPress = () => {
        this.show();
    };

    _onItemPress = (item) => {
        console.log("点击了item");
        this.setState({
            modalVisible: false,
            selectedIndex: item._index,
            selectedLabel: item.label,
            selectedItem: item,
            selectedValue: item.value,
            data: this._finalData,
        });
        this.props.onSelectCallBack(item.label);
    };

    hide = () => {
        this.setState({
            modalVisible: false
        });
    };

    /**
     * 该方法计算下拉框的宽高及位置
     * 位置优先：下、上、右、左 （基于按钮位置）
     * 宽度优先：dropDownListStyle 设置的 width、
     *          按钮的 width、
     *          默认的 width；
     *          当计算出的宽度大于剩余界面宽度限制时使用剩余界面宽度
     * 高度优先：dropDownListStyle 设置的 height、
     *          dropDownItemStyle 设置的 height * data 的 size + 分割线的高度（即将所有数据显示出来的高度）
     *          默认的 height；
     *          当计算出的高度大于剩余界面高度限制时使用剩余界面高度*/
    _calcPosition = () => {
        var style = {};
        let dropdownWidth = (this.props.dropDownListStyle && StyleSheet.flatten(this.props.dropDownListStyle).width) ||
            this._buttonFrame.w || StyleSheet.flatten(styles.modalViewStyle).width;
        let dropdownHeight = (this.props.dropDownListStyle && StyleSheet.flatten(this.props.dropDownListStyle).height) ||
            (this.props.dropDownItemStyle && StyleSheet.flatten(this.props.dropDownItemStyle).height * this.state.data.length + this.state.data.length - 1) ||
            (StyleSheet.flatten(styles.itemViewStyle).height * this.state.data.length + this.state.data.length - 1) ||
            StyleSheet.flatten(styles.modalViewStyle).height;
        console.log(dropdownHeight);
        if (this.props.enabledSearch) {
            dropdownHeight += 30;
        }
        let showOrientation;
        if (this.props.listShowOrientation === "bottom") {
            showOrientation = "bottom";
        } else if (this.props.listShowOrientation === "top") {
            showOrientation = "top";
        } else if (this.props.listShowOrientation === "right") {
            showOrientation = "right";
        } else if (this.props.listShowOrientation === "left") {
            showOrientation = "left";
        } else {
            if (dropdownHeight <= this._buttonFrame.bottomSpace) {
                showOrientation = "bottom";
            } else if (dropdownHeight <= this._buttonFrame.topSpace) {
                showOrientation = "top";
            } else if (dropdownWidth <= this._buttonFrame.rightSpace) {
                showOrientation = "right";
            } else if (dropdownWidth <= this._buttonFrame.leftSpace) {
                showOrientation = "left";
            } else {
                showOrientation = this._buttonFrame.bottomSpace >= this._buttonFrame.topSpace ? "bottom" : "top";
            }
        }
        switch (showOrientation) {
            case "bottom":
                style.top = this._buttonFrame.topSpace + this._buttonFrame.h;
                style.height = Math.min(dropdownHeight, this._buttonFrame.bottomSpace);
                style.width = Math.min(dropdownWidth, windowWidth);
                style.left = this._buttonFrame.w + this._buttonFrame.rightSpace > style.width ? this._buttonFrame.leftSpace : windowWidth - style.width;
                break;
            case "top":
                style.height = Math.min(dropdownHeight, this._buttonFrame.topSpace);
                style.top = this._buttonFrame.topSpace - style.height;
                style.width = Math.min(dropdownWidth, windowWidth);
                style.left = this._buttonFrame.w + this._buttonFrame.rightSpace > style.width ? this._buttonFrame.leftSpace : windowWidth - style.width;
                break;
            case "left":
                style.height = Math.min(dropdownHeight, windowHeight);
                style.width = Math.min(dropdownWidth, this._buttonFrame.leftSpace);
                style.top = this._buttonFrame.h + this._buttonFrame.bottomSpace >= style.height ? this._buttonFrame.topSpace : windowHeight - style.height;
                style.left = this._buttonFrame.leftSpace - style.width;
                break;
            case "right":
                style.height = Math.min(dropdownHeight, windowHeight);
                style.width = Math.min(dropdownWidth, this._buttonFrame.rightSpace);
                style.top = this._buttonFrame.h + this._buttonFrame.bottomSpace >= style.height ? this._buttonFrame.topSpace : windowHeight - style.height;
                style.left = this._buttonFrame.leftSpace + this._buttonFrame.w;
                break;
            default:
                break;
        }

        if (this.props.adjustFrame) {
            style = this.props.adjustFrame(style) || style;
        }
        console.log(this._buttonFrame);
        console.log(showOrientation);
        console.log(style)
        return style;
    };

    _searchFilterData = (text) => {
        let newData = [];
        let oldData = this._finalData;
        let i = 0;
        let selectedIndex;
        oldData.map((item, index) => {
            if (item.label.indexOf(text) >= 0) {
                newData[i++] = item;
                if (item.value == this.state.selectedValue) {
                    selectedIndex = i - 1;
                }
            }
        })
        this.setState({
            data: newData,
            initialScrollIndex: 0,
            selectedIndex: selectedIndex,
        })
    };

    _renderItem = (info) => {
        //console.log(info);
        const {item, index} = info;
        let selectedIndex = this.state.selectedIndex;
        return (
            <TouchableOpacity
                style={[styles.itemViewStyle, this.props.dropDownItemStyle]}
                onPress={() => this._onItemPress(item)}
            >
                {
                    (this.props.renderItem && this.props.renderItem({item, index, selectedIndex})) ||
                    <ItemView
                        item={item}
                        index={index}
                        selectedIndex={this.state.selectedIndex}
                    />
                }

            </TouchableOpacity>
        )
    };
    _renderSearch = (width) => {
        if (this.props.enabledSearch) {
            return (
                <View style={[styles.viewRow, {
                    height: 30,
                    borderWidth: 1,
                    borderRadius: 15,
                    width: width
                }]}>
                    <TextInput
                        ref={textInput => this._searchInput = textInput}
                        underlineColorAndroid="transparent"
                        placeholder={"请输入搜索"}
                        onChangeText={text => this._searchFilterData(text)}
                        style={{padding: 0, paddingLeft: 10, paddingRight: 5, width: width - 30}}
                    />
                    <TouchableOpacity
                        onPress={() => {
                            this._searchInput.clear();
                            this._searchFilterData("");
                        }}
                        style={{
                            width: 30,
                            borderWidth: 0,
                            borderRadius: 15,
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                        <Text style={{fontSize: 20}}>{"×"}</Text>
                    </TouchableOpacity>
                </View>
            );
        }
    };
    _renderList = () => {
        return (
            <FlatList
                keyExtractor={(item, index) => index}
                data={this.state.data}
                getItemLayout={(data, index) => {
                    let itemHeight = (this.props.dropDownItemStyle && StyleSheet.flatten(this.props.dropDownItemStyle).height)
                        || StyleSheet.flatten(styles.itemViewStyle).height;
                    return ( {length: itemHeight, offset: (itemHeight + 1) * index, index} );
                }}
                initialScrollIndex={this.state.initialScrollIndex}
                // initialNumToRender={5}
                onStartShouldSetResponderCapture={(evt) => {
                    console.log("内层事件劫持2start");
                    return true;
                }}
                onMoveShouldSetResponderCapture={(evt) => {
                    console.log("内层事件劫持2move");
                    return true;
                }}
                ItemSeparatorComponent={() => <View style={{height: 1, backgroundColor: "#e1e1e1"}}/>}
                renderItem={this._renderItem}
            />
        );
    };
    _renderContent = () => {
        if (this.state.modalVisible && this._buttonFrame) {
            let vStyle = this._calcPosition();
            return (
                <View
                    style={[styles.modalViewStyle, vStyle]}
                >
                    {this._renderSearch(vStyle.width)}
                    {this._renderList()}
                </View>
            );
        }
    };
    _renderButton = () => {
        return (
            <TouchableOpacity
                ref={button => this._button = button}
                disabled={this.props.disabled}
                accessible={this.props.accessible}
                style={[styles.buttonViewStyle, this.props.dropDownButtonStyle]}
                onPress={this._onButtonPress.bind(this)}>

                {
                    (this.props.renderButton && this.props.renderButton(this.state.selectedItem)) ||
                    <ButtonView
                        item={this.state.selectedItem}
                    />
                }

            </TouchableOpacity>
        );
    };
    _renderModal = () => {
        return (
            <Modal
                animationType={'fade'}
                visible={this.state.modalVisible}
                transparent={true}
                onRequestClose={() => {
                    this.hideModal();
                }}
                supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']}
            >
                <TouchableOpacity
                    style={{flex: 1}}
                    activeOpacity={0}
                    accessible={this.props.accessible}
                    onPress={() => {
                        this.hide()
                    }}>
                    {this._renderContent()}
                </TouchableOpacity>
            </Modal>
        );
    };

    render() {
        return (
            <View>
                {this._renderButton()}
                {this._renderModal()}
            </View>
        );
    }

}


/**
 * 默认的item*/
const ItemView = (props) => {
    const {item, index, selectedIndex} = props;
    let currStyle = {
        circleColor: {
            borderColor: '#525252',
        },
        textColor: {
            color: '#525252',
        }
    };
    if (index == selectedIndex) {
        currStyle.textColor.color = '#778aff';
    }
    return (
        <View style={[styles.root]}>
            <Text style={currStyle.textColor}>{item.label}</Text>
        </View>
    );
};
const ButtonView = (props) => {
    const {item} = props;
    return (
        <View style={[styles.root]}>
            <Text>{item.label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#ffffff',
        alignItems: "center",
        justifyContent: "center",
    },
    modalViewStyle: {
        backgroundColor: '#ffffff',
        width: 300,
        height: 400,
    },
    itemViewStyle: {
        height: 50,
    },
    buttonViewStyle: {
        width: 200,
        height: 50,
        borderWidth: 1,
    },
    viewRow: {
        flexDirection: 'row',
    },
    viewColumn: {
        flexDirection: 'column',
    },
});
