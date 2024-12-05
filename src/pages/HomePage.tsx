import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Divider, Pagination, Rate, Select, Slider, Switch, Input, Checkbox, Empty } from 'antd';
import { ReloadOutlined, CaretDownOutlined , CaretUpOutlined, SearchOutlined } from '@ant-design/icons';

import Header from '../components/layouts/Header';
import CardItem from '../components/CardItem';
import './HomePage.scss';
import { Product, Category, Filter, BrandOption, ResponseData, ActiveCatetories } from '../types';

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(16);
  const [activeItem, setActiveItem] = useState<ActiveCatetories>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [secondProducts, setSecondProducts] = useState<Product[]>([]);
  const [queryFilter, setQueryFilter] = useState<Filter>({freeShipping: true});
  const [paginatedItems, setPaginatedItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<ResponseData>({});
  const [ratings, setRatings] = useState<ResponseData>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  });
  const [priceRange, setPriceRange] = useState<[number, number]>([Infinity, -Infinity]);
  const [brandOptions, setBrandOptions] = useState<BrandOption[]>([]);

  const toggleCategory = (data: ActiveCatetories) => {
    if (activeItem.parent !== data.parent) {
      setActiveItem(data);
      onFilterChange('category', data.parent);
    } else {
      if(data.children === '') {
        setActiveItem({})
        onFilterChange('category', '');
      }else if(activeItem.children === data.children) {
        setActiveItem({
          ...activeItem,
          children: ''
        })
      onFilterChange('category', data.parent);
      } else {
        setActiveItem(data)
      onFilterChange('category', data.children);
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setCurrentPage(1);
  };

  const handleClearFilter = () => {
    setActiveItem({});
    setQueryFilter({});
    fetchAllData();
  }

  const onFilterChange = (key: string, value: any) => {
    setQueryFilter({
      ...queryFilter, [key]: value
    });
  }

  const fetchAllData = async () => {
    try {
      const productRes = await axios.get('http://localhost:3000/products');
      const categoryRes = await axios.get('http://localhost:3000/categories');
      setCategories(categoryRes.data);
      setProducts(productRes.data);
      setSecondProducts(productRes.data);
      paginateItems(productRes.data);
      getSubDataFromProduct(productRes.data);
    } catch (error) {
      console.log(error);
    }
  }

  const fetchFilterData = async () => {
    try {
      let res
      const params = new URLSearchParams();
      if (queryFilter.priceRange) params.append("price_gte", queryFilter.priceRange[0].toString());
      if (queryFilter.priceRange?.length === 2) params.append("price_lte", queryFilter.priceRange[1].toString());
      if (queryFilter.rating) params.append("rating", queryFilter.rating.toString());
      if (!queryFilter.freeShipping) params.append("free_shipping", "false")
        else params.append("freeShipping", "true");
      if(queryFilter?.rating || queryFilter?.priceRange?.length === 2 || queryFilter?.brand?.length) {
        res = await axios.get(`http://localhost:3000/products?${params.toString()}`);
      }
      let filterProducts: Product[] = res?.data || products; 
      if (queryFilter?.search) {
        filterProducts = filterProducts.filter((product) => 
          product.name.toLocaleLowerCase().includes(queryFilter.search?.toLocaleLowerCase() ?? ''
          ));
      }
      if (queryFilter?.category) {
        filterProducts = filterProducts.filter((product) => product.categories.includes(queryFilter.category ?? ''));
      }
      if (queryFilter?.brand?.length) {
        filterProducts = filterProducts.filter((product) => queryFilter.brand?.includes(product.brand));
      }
      getSubDataFromProduct(filterProducts);
      setSecondProducts(filterProducts);
      paginateItems(filterProducts);
    } catch (error) {
      console.log(error);
    }
  }

  const getSubDataFromProduct = (data: Product[]) => {
    const brandCount: { [key: string]: number } = {};
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let tmpRatings: ResponseData = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    }

    data.forEach((product: Product) => {
      brandCount[product.brand] = (brandCount[product.brand] || 0) + 1;

      if (product.price < minPrice) minPrice = product.price;
      if (product.price > maxPrice) maxPrice = product.price;

      if (product.rating >= 1 && product.rating <= 5) {
        tmpRatings[product.rating] += 1;
      }
    });
    const brandsParse = Object.keys(brandCount).map((key) => ({
      label: key,
      value: key,
    }));
    setRatings(tmpRatings);
    setPriceRange([minPrice, maxPrice]);
    setBrands(brandCount);
    if(!queryFilter.brand?.length) {
      setBrandOptions(brandsParse);
    }
  }

  const paginateItems = (data: Product[]) => {
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedList = data.slice(startIndex, startIndex + pageSize);
    setPaginatedItems(paginatedList);
  }

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    fetchFilterData()
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
            <div className="flex gap-2 items-center cursor-pointer" onClick={handleClearFilter}>
              <ReloadOutlined style={{fontSize: '10px'}}/>
              <p className="text-xs text-[rgba(33,36,61,.5)]">Refresh Filter</p>
            </div>
          </div>
          <Divider style={{margin: 0}} />
          <div className="py-8">
            <h2 className="filter-title">Category</h2>
            <ul className="mt-2">
              {
                categories.slice().map((category, index) => (
                  <li key={index} className="mb-3" >
                    <div
                      className={`flex items-center gap-2 cursor-pointer ${(activeItem.parent === category.name) && 'font-semibold'} `}
                      onClick={() => toggleCategory({
                        parent: category.name,
                        children: ''
                      })}
                    >
                      {activeItem.parent === category.name ? (
                        <CaretDownOutlined style={{ color: "grey", fontSize: "8px" }} />
                      ) : (
                        <CaretUpOutlined style={{ color: "grey", fontSize: "8px" }} />
                      )}
                      <div className="flex items-center gap-2">
                        <span>{category.name}</span>
                        <div className="text-xs font-semibold p-0.5 rounded bg-[rgba(65,66,71,.08)]">{category.total}</div>
                      </div>
                    </div>
                    {(activeItem.parent === category.name) && category.subcategories && (
                      <ul className="ml-6 mt-2">
                        {category.subcategories.map((child, childIndex) => (
                          <li key={childIndex} className="mb-3" onClick={() => toggleCategory({
                            parent: category.name,
                            children: child.name
                          })}>
                            <div className={`flex items-center gap-2 cursor-pointer ${activeItem.children === child.name && 'font-semibold'} `}>
                              {
                                activeItem.children === child.name ? (
                                <CaretDownOutlined style={{ color: "grey", fontSize: "8px" }} />
                                ) : (
                                  <CaretUpOutlined style={{ color: "grey", fontSize: "8px" }} />
                                )
                              }
                              <div className="flex items-center gap-2">
                                <span>{child.name}</span>
                                <div className="text-xs font-semibold p-0.5 rounded bg-[rgba(65,66,71,.08)]">{child.total}</div>
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
              <Checkbox.Group options={brandOptions} value={queryFilter.brand} onChange={(value) => onFilterChange('brand', value)} className="flex flex-col gap-2"/>
            </div>
          </div>
          <Divider style={{margin: 0}} />
          <div className="py-8">
            <h2 className="filter-title">Price</h2>
            <Slider
              range
              min={1}
              max={1555}
              styles={
                {
                  track: {
                    backgroundColor: '#e2a400'
                  }
                }
              }
              step={1}
              defaultValue={priceRange}
              onChangeComplete={(value) => onFilterChange('priceRange', value)}
            />
          </div>
          <Divider style={{margin: 0}} />
          <div className="py-8">
            <h2 className="filter-title">Free shipping</h2>
            <div className="flex gap-1">
              <span className="text-[.9rem] ">Display only items with free shipping</span>
              <div className="flex items-center gap-1">
                <span className={`${true && 'text-[#e2a400]'} text-[.8rem]`}>{true? 'Yes' : 'No'}</span>
                <Switch
                  value={queryFilter.freeShipping}
                  onChange={(value) => onFilterChange('freeShipping', value)}
                  defaultChecked size={'small'}
                  className="text-[#e2a400]"
                />
              </div>
            </div>
          </div>
          <Divider style={{margin: 0}} />
          <div className="py-8">
            <h2 className="filter-title">Ratings</h2>
            <div>
              {Object.entries(ratings).reverse().map(([key, value]) => (
                <div className="flex items-center gap-2 cursor-pointer" key={key} onClick={() => onFilterChange('rating', key)}>
                  <Rate disabled defaultValue={Number(key)} />
                  <span className="ratings-count">{value}</span>
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
              defaultValue={16}
              onChange={handlePageSizeChange}
              variant="borderless"
              options={[
                { value: 16, label: '16 hits per page' },
                { value: 32, label: '32 hits per page' },
                { value: 64, label: '64 hits per page' },
              ]}
            />
          </div>
          <Divider />
          <div>
              {!paginatedItems.length?
              <div className="mt-20">
                <Empty />
              </div>
              : (<div className="grid grid-cols-4 gap-12">
                  {paginatedItems.map((item, index) => (
                    <CardItem item={item} key={index} />
                  ))}
                </div>)
              }
              {
                secondProducts.length > pageSize && 
                <Pagination
                  align="center"
                  current={currentPage}
                  pageSize={pageSize}
                  total={secondProducts.length}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                />
              }
          </div>
        </div>
      </main>
    </div>
  );
}
