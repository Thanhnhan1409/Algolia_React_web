import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Divider, Pagination, Rate, Select, Slider, Switch, Input, Checkbox } from 'antd';
import { ReloadOutlined, CaretDownOutlined , CaretUpOutlined, SearchOutlined } from '@ant-design/icons';

import Header from '../components/layouts/Header';
import CardItem from '../components/CardItem';
import './HomePage.scss';
import { Product, Category, Filter, Brand } from '../types';

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(8);
  const [activeItem, setActiveItem] = useState<number>(-1);
  const [products, setProducts] = useState<Product[]>([]);
  const [queryFilter, setQueryFilter] = useState<Filter>({});
  const [paginatedItems, setPaginatedItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const toggleCategory = (key: number, value: string) => {
    onFilterChange('category', value );
    setActiveItem((prev) => (prev === key ? -1 : key));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setCurrentPage(1);
  };

  const handleClearFilter = () => {
    setActiveItem(-1);
  }

  const onFilterChange = (key: string, value: any) => {
    setQueryFilter({
      ...queryFilter, [key]: value
    });
  }

  const onChangeComplete = (value: number[]) => {
    console.log('Price range changed', value);
  }

  const fetchData = async () => {
    try {
      let stringFilter = '';
    if (queryFilter.search) {
      stringFilter += `&q=${queryFilter.search}`;
    }
    if (queryFilter.category) {
      stringFilter += `&category=${queryFilter.category}`;
    }
    if (queryFilter.priceRange) {
      stringFilter += `&priceRange=${queryFilter.priceRange}`;
    }
    if (queryFilter.rating) {
      stringFilter += `&rating=${queryFilter.rating}`;
    }
    if (queryFilter.brand) {
      stringFilter += `&brand=${queryFilter.brand}`;
    }
    if (queryFilter.freeShipping) {
      stringFilter += `&freeShipping=${queryFilter.freeShipping}`;
    }
    const params = new URLSearchParams();

    if (queryFilter.search) params.append("name", queryFilter.search);
    if (queryFilter.brand?.length) queryFilter.brand.forEach((brand) => params.append("brand", brand));
    if (queryFilter.category) params.append("categories", queryFilter.category);
    if (queryFilter.priceRange) params.append("price_gte", queryFilter.priceRange[0].toString());
    if (queryFilter.priceRange?.length === 2) params.append("price_lte", queryFilter.priceRange[1].toString());
    // if (queryFilter.freeShipping === false) params.append("freeShipping", "false")
    //   else params.append("freeShipping", "true");
    const res = await axios.get(`http://localhost:3000/products?${params.toString()}`);
    console.log('brands',res.data?.map((product: Product) => product.brand));
    const tmpList: string[] = Array.from(
      new Set(res.data?.map((product: Product) => product.brand))
    )
    const brandsData: Brand[] = tmpList.map((uniqueBrand) => ({
      label: uniqueBrand,
      value: uniqueBrand,
    }));
    setBrands(brandsData);
    setProducts(res.data);
    console.log(res.data);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedList = res.data.slice(startIndex, startIndex + pageSize);
    setPaginatedItems(paginatedList);
    console.log('Query filter changed', paginatedList);
    } catch (error) {
      console.log(error);
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:3000/categories');
      console.log(res.data);
      setCategories(res.data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    setCurrentPage(1);
    fetchData();
    fetchCategories();
    // fetchBrands();
  }, [queryFilter]);

  useEffect (() => {
    setPaginatedItems(products.slice((currentPage - 1) * pageSize, currentPage * pageSize));
  }, [currentPage, pageSize]);

  return (
    <div>
      <Header onSearchChange={onFilterChange} />
      <main className="flex max-w-[1300px] mx-[auto] py-8 px-4">
        <nav className="w-[260px] mr-[60px] flex flex-col">
          <div className="flex justify-between h-fit min-h-[80px] mb-2">
            <h1 className="font-semibold text-2xl text-center my-[auto]">Filters</h1>
            <div className="flex gap-2 items-center">
              <ReloadOutlined style={{fontSize: '10px'}}/>
              <p className="text-xs text-[rgba(33,36,61,.5)] cursor-pointer" onClick={handleClearFilter}>Refresh Filter</p>
            </div>
          </div>
          <Divider style={{margin: 0}} />
          <div className="py-8">
            <h2 className="filter-title">Category</h2>
            <ul className="mt-2">
              {
                categories.map((category) => (
                  <li key={category.key} className="mb-3" >
                    <div
                      className={`flex items-center gap-2 cursor-pointer ${(activeItem === category.key  || category.children?.find((item) => item.key === activeItem)) && 'font-semibold'} `}
                      onClick={() => toggleCategory(category.key, category.title)}
                    >
                      {activeItem === category.key ? (
                        <CaretDownOutlined style={{ color: "grey", fontSize: "8px" }} />
                      ) : (
                        <CaretUpOutlined style={{ color: "grey", fontSize: "8px" }} />
                      )}
                      <div className="flex items-center gap-2">
                        <span>{category.title}</span>
                        <div className="text-xs font-semibold p-0.5 rounded bg-[rgba(65,66,71,.08)]">{category.value}</div>
                      </div>
                    </div>
                    {(activeItem === category.key  || category.children?.find((item) => item.key === activeItem)) && category.children && (
                      <ul className="ml-6">
                        {category.children.map((child) => (
                          <li key={child.key} className="mb-3" onClick={() => toggleCategory(child.key, child.title)}>
                            <div className={`flex items-center gap-2 cursor-pointer ${activeItem === child.key && 'font-semibold'} `}>
                              {
                                activeItem === child.key ? (
                                <CaretDownOutlined style={{ color: "grey", fontSize: "8px" }} />
                                ) : (
                                  <CaretUpOutlined style={{ color: "grey", fontSize: "8px" }} />
                                )
                              }
                              <div className="flex items-center gap-2">
                                <span>{category.title}</span>
                                <div className="text-xs font-semibold p-0.5 rounded bg-[rgba(65,66,71,.08)]">{child.value}</div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))
              }
            </ul>
          </div>
          <Divider style={{margin: 0}} />
          <div className="py-8">
            <h2 className="filter-title">Brands</h2>
            <Input
              placeholder="Search for brands..."
              prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,.8)', fontSize: '12px', padding: '0 8px' }} />}
              size="large"
              style={{ backgroundColor: '#F4F4F4', borderRadius: '4px', border: 'none' }}
            />
            <div className="mt-4">
              <Checkbox.Group options={brands} value={queryFilter.brand} className="flex flex-col gap-2"/>
            </div>
          </div>
          <Divider style={{margin: 0}} />
          <div className="py-8">
            <h2 className="filter-title">Price</h2>
            <Slider
              range
              min={1}
              max={4800}
              styles={
                {
                  track: {
                    backgroundColor: '#e2a400'
                  }
                }
              }
              step={1}
              defaultValue={[1, 4800]}
              onChangeComplete={onChangeComplete}
            />
          </div>
          <Divider style={{margin: 0}} />
          <div className="py-8">
            <h2 className="filter-title">Free shipping</h2>
            <div className="flex gap-1">
              <span className="text-[.9rem] ">Display only items with free shipping</span>
              <div className="flex items-center gap-1">
                <span className={`${true && 'text-[#e2a400]'} text-[.8rem]`}>{true? 'Yes' : 'No'}</span>
                <Switch defaultChecked size={'small'} className="bg-[#e2a400] text-[#e2a400]"/>
              </div>
            </div>
          </div>
          <Divider style={{margin: 0}} />
          <div className="py-8">
            <h2 className="filter-title">Ratings</h2>
            <div>
              {[5, 4, 3, 2, 1].map((rating, index) => (
                <div className="flex items-center gap-2" key={index}>
                  <Rate disabled defaultValue={rating} />
                  <span className="ratings-count">111</span>
                </div>
              ))}
            </div>
          </div>
        </nav>
        <div className="w-[946px]">
          <div className="mt-8 mb-1.5 text-end">
            <Select
              defaultValue="featured"
              // style={{ width: 150 }}
              onChange={() => console.log('Sort changed')}
              variant="borderless"
              options={[
                { value: 'featured', label: 'Sort by featured' },
                { value: 'asc', label: 'Price Ascending' },
                { value: 'des', label: 'Price Descending' },
              ]}
            />
            <Select
              defaultValue={8}
              // style={{ width: 150 }}
              onChange={handlePageSizeChange}
              variant="borderless"
              options={[
                { value: 8, label: '8 hits per page' },
                { value: 16, label: '16 hits per page' },
                { value: 32, label: '32 hits per page' },
              ]}
            />
          </div>
          <Divider />
          <div>
            <div className="grid grid-cols-4 gap-12">
              {paginatedItems.map((item, index) => (
                <CardItem item={item} key={index} />
              ))}
            </div>
            <Pagination
              align="center"
              current={currentPage}
              pageSize={pageSize}
              total={products.length}
              onChange={handlePageChange}
              showSizeChanger={false}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
