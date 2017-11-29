# react-native-dropdown-box
一个支持Android&Ios的React Native下拉框组件
## 安装
```sh
 yarn add react-native-dropdown-box
```
## 使用
### 基础
导入组件:
```javascript
import DropDownBox from 'react-native-dropdown-box';
```
使用DropDownBox组件:
```javascript
<DropDownBox data={[{id:1,value:"a",label:"item1"},{id:2,value:"b",label:"item2"}]}/>              
```
## API
### 属性
属性                 | 类型      | 可选     | 默认      | 说明
-------------------  | -------- | -------- | --------- | -----------
`disabled`           | bool     | 是       | false     | 控制下拉框的显示按钮是否可用 true 按钮不可用;false 按钮可用
`enabledSearch`      | bool     | 是       | false     | 控制是否显示搜索框 true 显示;false 不显示
`listShowOrientation`| string   | 是       | defalut   | 指定控制list位于button的方位, 可选值：default,bottom,right,top,left
`defaultIndex`       | number   | 是       | 0         | 指定显示数据的index 
`data`               | array    | 否       |           | 下拉列表的数据，示例:[{id:1,value:"a",label:"item1"},{id:2,value:"b",label:"item2"}]
`renderItem`         | func     | 是       |           | 自定义绘制item， 该方法参数为对象，其中包含item：该列的数据；index：当前列的index；selectedIndex：当前选中的index ，当实现该方法时，请自行根据 index==selectedIndex 定义 当前选中行要显示的style
`renderButton`       | func     | 是       |           | 自定义绘制button，该方法参数为item
`onSelectCallBack`   | func     | 是       |           | 回调函数，返回选中的item
`dropDownListStyle`  | object   | 是       |           | 下拉列表的style，指定下拉列表的宽高，优先级最高； 当list的宽度大于要显示界面剩余宽度时，使用界面剩余宽度； 当list的高度大于要显示界面剩余高度时，使用界面剩余高度
`dropDownButtonStyle`| object   | 是       |           | 按钮的style，指定按钮的宽高，且当dropDownListStyle不指定宽度时，优先以按钮的宽度； 当list的宽度大于要显示界面剩余宽度时，使用界面剩余宽度
`dropDownItemStyle`  | object   | 是       |           | item的style，指定item的宽高，且当dropDownListStyle不指定高度时，优先以item的高度*item的数量作为list的高度， 当list的高度大于要显示界面剩余高度时，使用界面剩余高度
